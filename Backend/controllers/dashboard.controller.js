const mongoose = require('mongoose');
const { TaskAssignment, User, Project } = require('../models');

// helper to compute date range
function getDateRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  if (!period || period === 'this_month') {
    const start = new Date(year, month, 1);
    const end = now;
    return { start, end };
  }

  if (period === 'last_month') {
    const lastMonth = month - 1;
    const start = new Date(year, lastMonth, 1);
    // end = last day of lastMonth
    const end = new Date(year, lastMonth + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'this_year') {
    const start = new Date(year, 0, 1);
    const end = now;
    return { start, end };
  }

  // custom or 'all'
  return null;
}

const getDashboardData = async (req, res) => {
  try {
    const period = (req.query.period || 'this_month'); // this_month | last_month | this_year | all
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    // 1. Get employee statistics
    const totalEmployees = await User.countDocuments({});
    const resignedEmployees = await User.countDocuments({ isActive: false });

    // 2. Get project statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const projectStatistics = {
      completed: 0,
      inProgress: 0,
      onHold: 0,
      rejected: 0
    };

    projectStats.forEach(stat => {
      switch(stat._id.toLowerCase()) {
        case 'completed':
          projectStatistics.completed = stat.count;
          break;
        case 'in progress':
          projectStatistics.inProgress = stat.count;
          break;
        case 'on hold':
          projectStatistics.onHold = stat.count;
          break;
        case 'rejected':
          projectStatistics.rejected = stat.count;
          break;
      }
    });

    // 3. Get top contributors (existing logic)

    const range = getDateRange(period);

    // Build aggregation pipeline on TaskAssignment -> Task (count tasks with status 'done')
    const pipeline = [
      // join tasks
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      // only tasks marked done
      { $match: { 'task.status': 'done' } },
      // canonical completion date: prefer explicit endDate, fall back to updatedAt
      {
        $addFields: {
          completionDate: { $ifNull: ['$task.endDate', '$task.updatedAt'] },
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
          _id: '$userId',
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
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: '$_id',
          doneCount: 1,
          'user._id': 1,
          'user.name': 1,
          'user.email': 1,
          'user.position': 1,
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
      const Position = require('../models').Position;
      const posDocs = await Position.find({ _id: { $in: positionIds } }).select('name').lean();
      posDocs.forEach((p) => positionMap.set(String(p._id), p.name));
    }

    const formatted = results.map((r) => ({
      userId: r.user ? r.user._id : r.userId,
      name: r.user ? r.user.name : null,
      email: r.user ? r.user.email : null,
      position: r.user && r.user.position ? positionMap.get(String(r.user.position)) || null : null,
      doneCount: r.doneCount,
    }));

    return res.json({
      success: true,
      data: {
        statistics: {
          totalEmployees: {
            count: totalEmployees
          },
          resignedEmployees: {
            count: resignedEmployees
          }
        },
        projectStatistics: projectStatistics,
        topContributors: formatted
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getDashboardData error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
};

module.exports = {
  getDashboardData,
};