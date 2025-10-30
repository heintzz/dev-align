const { Project } = require('../models');

const createProject = async (req, res) => {
  const { name, description, status, deadline, teamMemberCount } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Project name must be specified',
    });
  }

  if (!description || description.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Project description must be specified',
    });
  }

  try {
    const projectData = {
      name,
      description,
      createdBy: req.user.id, // Assuming user ID comes from auth middleware
    };

    if (status) projectData.status = status;
    if (deadline) projectData.deadline = deadline;
    if (teamMemberCount !== undefined) projectData.teamMemberCount = teamMemberCount;

    const project = await Project.create(projectData);

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getProjects = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 15);
  const skip = perPage ? (page - 1) * perPage : 0;

  try {
    const filter = {};

    // If user is a manager, only show their own projects
    if (req.user.role === 'manager') {
      filter.createdBy = req.user.id;
    }

    // Optional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Allow HR to filter by specific creator if needed
    if (req.query.createdBy && req.user.role === 'hr') {
      filter.createdBy = req.query.createdBy;
    }

    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('createdBy', 'name email role')
        .select('name description status deadline teamMemberCount createdBy createdAt updatedAt'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        page,
        perPage,
        total,
        projects,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 15);
  const skip = perPage ? (page - 1) * perPage : 0;

  try {
    const filter = {};

    // Optional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }

    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('createdBy', 'name email role')
        .select('name description status deadline teamMemberCount createdBy createdAt updatedAt'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        page,
        perPage,
        total,
        projects,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, deadline, teamMemberCount } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Update fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;
    if (teamMemberCount !== undefined) project.teamMemberCount = teamMemberCount;

    await project.save();

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    await project.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
