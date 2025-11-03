const { ProjectAssignment, User } = require("../models");

const assignUserToProject = async (req, res) => {
  const { projectId, userId } = req.body;

  if (!projectId || !userId) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Project ID and User ID must be specified",
    });
  }

  try {
    // Check if assignment already exists
    const existingAssignment = await ProjectAssignment.findOne({
      projectId,
      userId,
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "User is already assigned to this project",
      });
    }

    // Get user to check their role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      });
    }

    // Automatically set isTechLead to true if user role is 'manager'
    const isTechLead =
      user.role === "manager" ? true : req.body.isTechLead || false;

    const assignment = await ProjectAssignment.create({
      projectId,
      userId,
      isTechLead,
    });

    const populatedAssignment = await ProjectAssignment.findById(assignment._id)
      .populate("userId", "name email role")
      .populate("projectId", "name description status");

    return res.status(201).json({
      success: true,
      data: populatedAssignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const getProjectAssignments = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 15);
  const skip = perPage ? (page - 1) * perPage : 0;

  try {
    const filter = {};

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.isTechLead !== undefined) {
      filter.isTechLead = req.query.isTechLead === "true";
    }

    const [total, assignments] = await Promise.all([
      ProjectAssignment.countDocuments(filter),
      ProjectAssignment.find(filter)
        .skip(skip)
        .limit(perPage)
        .populate({
          path: "userId",
          select: "name email role position",
          populate: {
            path: "position",
            select: "_id name",
          },
        })
        .populate("projectId", "name description status deadline"),
    ]);

    const projectsMap = new Map();

    assignments.forEach((assignment) => {
      const project = assignment.projectId;
      const user = assignment.userId;

      if (!project || !user) return;

      if (!projectsMap.has(project._id.toString())) {
        projectsMap.set(project._id.toString(), {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          deadline: project.deadline,
          assignedEmployees: [],
        });
      }

      projectsMap.get(project._id.toString()).assignedEmployees.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
      });
    });

    const projects = Array.from(projectsMap.values());

    return res.status(200).json({
      success: true,
      data: {
        page,
        perPage,
        total,
        project: projects.length === 1 ? projects[0] : projects,
      },
    });
  } catch (err) {
    console.error("Error fetching project assignments:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ProjectAssignment.findById(assignmentId)
      .populate({
        path: "userId",
        select: "name email role position",
        populate: {
          path: "position",
          select: "_id name",
        },
      })
      .populate("projectId", "name description status deadline");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { isTechLead } = req.body;

    const assignment = await ProjectAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Assignment not found",
      });
    }

    // Get user to check their role
    const user = await User.findById(assignment.userId);

    // If user is a manager, they must remain as tech lead
    if (user.role === "manager") {
      assignment.isTechLead = true;
    } else if (isTechLead !== undefined) {
      assignment.isTechLead = isTechLead;
    }

    await assignment.save();

    const updatedAssignment = await ProjectAssignment.findById(assignmentId)
      .populate("userId", "name email role")
      .populate("projectId", "name description status");

    return res.status(200).json({
      success: true,
      data: updatedAssignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const removeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ProjectAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Assignment not found",
      });
    }

    await assignment.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

module.exports = {
  assignUserToProject,
  getProjectAssignments,
  getAssignmentById,
  updateAssignment,
  removeAssignment,
};
