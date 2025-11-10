const mongoose = require("mongoose");
const {
  TaskAssignment,
  User,
  Project,
  ProjectAssignment,
} = require("../models");

// helper to compute date range
function getDateRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  if (!period || period === "this_month") {
    const start = new Date(year, month, 1);
    const end = now;
    return { start, end };
  }

  if (period === "last_month") {
    const lastMonth = month - 1;
    const start = new Date(year, lastMonth, 1);
    // end = last day of lastMonth
    const end = new Date(year, lastMonth + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === "this_year") {
    const start = new Date(year, 0, 1);
    const end = now;
    return { start, end };
  }

  // custom or 'all'
  return null;
}

const getDashboardData = async (req, res) => {
  try {
    const period = req.query.period || "this_month"; // this_month | last_month | this_year | all
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    // 1. Get employee statistics
    const totalEmployees = await User.countDocuments({ active: true });
    const resignedEmployees = await User.countDocuments({ active: false }); // Changed from isActive to active

    // 2. Get project statistics
    const projectStats = await Project.aggregate([
      {
        $addFields: {
          normalizedStatus: { $toLower: "$status" },
        },
      },
      {
        $facet: {
          completed: [
            { $match: { normalizedStatus: "completed" } },
            { $count: "count" },
          ],
          inProgress: [
            { $match: { normalizedStatus: { $ne: "completed" } } },
            { $count: "count" },
          ],
          overdue: [
            {
              $match: {
                normalizedStatus: { $ne: "completed" },
                deadline: { $lt: new Date() },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          completed: {
            $ifNull: [{ $arrayElemAt: ["$completed.count", 0] }, 0],
          },
          inProgress: {
            $ifNull: [{ $arrayElemAt: ["$inProgress.count", 0] }, 0],
          },
          overdue: { $ifNull: [{ $arrayElemAt: ["$overdue.count", 0] }, 0] },
        },
      },
    ]);

    // Debug log to see actual statuses
    console.log("Raw Project Stats:", projectStats);

    const projectStatistics = projectStats[0];

    // Debug log final statistics
    console.log("Final Project Statistics:", projectStatistics);

    // 3. Get top contributors (existing logic)

    const range = getDateRange(period);

    // Build aggregation pipeline on TaskAssignment -> Task (count tasks with status 'done')
    const pipeline = [
      // join tasks
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      { $unwind: "$task" },
      // only tasks marked done
      { $match: { "task.status": "done" } },
      // canonical completion date: prefer explicit endDate, fall back to updatedAt
      {
        $addFields: {
          completionDate: { $ifNull: ["$task.endDate", "$task.updatedAt"] },
        },
      },
    ];

    if (range) {
      pipeline.push({
        $match: {
          completionDate: { $gte: range.start, $lte: range.end },
        },
      });
    }

    // group by user and count tasks done
    pipeline.push(
      {
        $group: {
          _id: "$userId",
          doneCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          doneCount: 1,
        },
      },
      { $sort: { doneCount: -1 } },
      { $limit: limit },
      // lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          doneCount: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.position": 1,
        },
      }
    );

    const results = await TaskAssignment.aggregate(pipeline).exec();

    // Fetch position details for users that have position id to return name if available
    const positionIds = results
      .map((r) => (r.user && r.user.position ? String(r.user.position) : null))
      .filter(Boolean);

    // populate position names if any
    let positionMap = new Map();
    if (positionIds.length > 0) {
      const Position = require("../models").Position;
      const posDocs = await Position.find({ _id: { $in: positionIds } })
        .select("name")
        .lean();
      posDocs.forEach((p) => positionMap.set(String(p._id), p.name));
    }

    const formatted = results.map((r) => ({
      userId: r.user ? r.user._id : r.userId,
      name: r.user ? r.user.name : null,
      email: r.user ? r.user.email : null,
      position:
        r.user && r.user.position
          ? positionMap.get(String(r.user.position)) || null
          : null,
      doneCount: r.doneCount,
    }));

    const topContributors = formatted
      .sort((a, b) => b.doneCount - a.doneCount)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        statistics: {
          totalEmployees: {
            count: totalEmployees,
          },
          resignedEmployees: {
            count: resignedEmployees,
          },
        },
        projectStatistics: projectStatistics,
        topContributors: topContributors,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getDashboardData error", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

module.exports = {
  getDashboardData,
};

const getManagerDashboard = async (req, res) => {
  try {
    const requester = req.user || {};
    const requesterId = requester._id || requester.id;
    if (!requesterId)
      return res.status(401).json({ success: false, error: "Unauthorized" });
    if (requester.role !== "manager")
      return res.status(403).json({ success: false, error: "Forbidden" });

    const managerId = new mongoose.Types.ObjectId(String(requesterId));

    // ========== PAGINATION PARAMETERS ==========
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ========== SEARCH AND SORT PARAMETERS ==========
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "name";

    // ========== BUILD SEARCH QUERY ==========
    const searchQuery = {
      managerId: managerId,
      active: true,
    };

    console.log(searchQuery);

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // ========== GET TOTAL COUNT FOR PAGINATION ==========
    const totalCount = await User.countDocuments(searchQuery);

    // ========== BUILD SORT OBJECT ==========

    // ========== FIND TEAM MEMBERS WITH PAGINATION ==========
    const teamMembers = await User.find(searchQuery)
      .select("_id name email position")
      .skip(skip)
      .limit(limit)
      .lean();

    const teamIds = teamMembers.map(
      (m) => new mongoose.Types.ObjectId(String(m._id))
    );

    // ========== GET POSITION DETAILS ==========
    const Position = require("../models").Position;
    const positionIds = teamMembers
      .map((m) => (m.position ? String(m.position) : null))
      .filter(Boolean);

    const positionMap = new Map();
    if (positionIds.length > 0) {
      const positions = await Position.find({ _id: { $in: positionIds } })
        .select("name")
        .lean();
      positions.forEach((p) => positionMap.set(String(p._id), p.name));
    }

    // ========== COUNT PROJECTS BY STATUS ==========
    const Project = require("../models").Project;
    const projectStatusAgg = await Project.aggregate([
      { $match: { createdBy: managerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    let totalProjects = 0;
    let projectsComplete = 0;
    let projectsOnGoing = 0;
    projectStatusAgg.forEach((g) => {
      console.log("the g");
      console.log(g);
      totalProjects += g.count;
      if (String(g._id).toLowerCase() === "completed")
        projectsComplete += g.count;
      else projectsOnGoing += g.count;
    });

    // ========== GET PROJECT COUNTS PER USER ==========
    const ProjectAssignment = require("../models").ProjectAssignment;
    const perUserCounts = await ProjectAssignment.aggregate([
      { $match: { userId: { $in: teamIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]).exec();
    const countsMap = new Map(
      perUserCounts.map((c) => [String(c._id), c.count])
    );

    // ========== BUILD TEAM ARRAY ==========
    let team = teamMembers.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      position: {
        id: m.position || null,
        name: m.position ? positionMap.get(String(m.position)) || null : null,
      },
      projectCount: countsMap.get(String(m._id)) || 0,
    }));

    // ========== SORT BY PROJECT COUNT IF NEEDED ==========
    if (sortBy === "asc") {
      team.sort((a, b) => a.projectCount - b.projectCount);
    } else if (sortBy === "desc") {
      team.sort((a, b) => b.projectCount - a.projectCount);
    }

    // ========== CALCULATE PAGINATION METADATA ==========
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // ========== RETURN RESPONSE WITH PAGINATION ==========
    return res.json({
      success: true,
      data: {
        statistics: {
          totalProjects,
          projectsComplete,
          projectsOnGoing,
        },
        team,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          total: totalCount,
        },
      },
    });
  } catch (err) {
    console.error("getManagerDashboard error", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

module.exports = {
  getDashboardData,
  getManagerDashboard,
};
