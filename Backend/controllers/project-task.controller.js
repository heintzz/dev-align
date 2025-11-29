const { User, Project, ProjectAssignment, Task, TaskAssignment } = require('../models');
const mongoose = require('mongoose');

const getStaffProjects = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    // Debug: log who is requesting staff projects
    console.log('[getStaffProjects] requester token payload:', req.user);
    console.log('[getStaffProjects] resolved userId:', userId);

    // Get all project assignments for this user
    const assignments = await ProjectAssignment.find({ userId })
      .populate({
        path: 'projectId',
        select: 'name description status startDate deadline teamMemberCount',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      });

    console.log('[getStaffProjects] assignments found:', assignments.length);

    // Map assignments to project details with role info
    const projects = assignments.map(assignment => ({
      id: assignment.projectId._id,
      name: assignment.projectId.name,
      description: assignment.projectId.description,
      status: assignment.projectId.status,
      startDate: assignment.projectId.startDate,
      deadline: assignment.projectId.deadline,
      teamMemberCount: assignment.projectId.teamMemberCount,
      manager: {
        id: assignment.projectId.createdBy._id,
        name: assignment.projectId.createdBy.name,
        email: assignment.projectId.createdBy.email,
      },
      role: assignment.isTechLead ? 'tech_lead' : 'member',
    }));

    return res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getStaffProjectDetail = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid project ID format' 
      });
    }

    // Check if user is assigned to this project
    const assignment = await ProjectAssignment.findOne({ 
      projectId, 
      userId 
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not assigned to this project',
      });
    }

    // Get project details with manager info
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get all team members
    const teamAssignments = await ProjectAssignment.find({ projectId })
      .populate('userId', 'name email position');

    // Get all tasks for the project
    const tasks = await Task.find({ projectId })
      .populate('requiredSkills', 'name')
      .populate('createdBy', 'name email');

    // Get task assignments
    const taskAssignments = await TaskAssignment.find({ 
      taskId: { $in: tasks.map(t => t._id) } 
    }).populate('userId', 'name email');

    // Map tasks with their assignments
    const mappedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      requiredSkills: task.requiredSkills,
      createdBy: {
        id: task.createdBy._id,
        name: task.createdBy.name,
        email: task.createdBy.email,
      },
      assignees: taskAssignments
        .filter(ta => ta.taskId.equals(task._id))
        .map(ta => ({
          id: ta.userId._id,
          name: ta.userId.name,
          email: ta.userId.email,
        })),
    }));

    // Prepare response
    const response = {
      id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline,
      teamMemberCount: project.teamMemberCount,
      manager: {
        id: project.createdBy._id,
        name: project.createdBy.name,
        email: project.createdBy.email,
      },
      userRole: assignment.isTechLead ? 'tech_lead' : 'member',
      team: teamAssignments.map(ta => ({
        id: ta.userId._id,
        name: ta.userId.name,
        email: ta.userId.email,
        position: ta.userId.position,
        role: ta.isTechLead ? 'tech_lead' : 'member',
      })),
      tasks: mappedTasks,
    };

    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid project ID format' 
      });
    }

    // Check if user is assigned to this project
    const assignment = await ProjectAssignment.findOne({ projectId, userId });
    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not assigned to this project',
      });
    }

    // Get all tasks for the project
    const tasks = await Task.find({ projectId })
      .populate('requiredSkills', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get task assignments in one query
    const taskAssignments = await TaskAssignment.find({
      taskId: { $in: tasks.map(t => t._id) }
    }).populate('userId', 'name email');

    // Map tasks with assignments
    const mappedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      requiredSkills: task.requiredSkills.map(s => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: task.createdBy._id,
        name: task.createdBy.name,
        email: task.createdBy.email,
      },
      assignees: taskAssignments
        .filter(ta => ta.taskId.equals(task._id))
        .map(ta => ({
          id: ta.userId._id,
          name: ta.userId.name,
          email: ta.userId.email,
        })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return res.json({
      success: true,
      data: mappedTasks,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid task ID format' 
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId).select('projectId status');
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // Check if user is assigned to this project
    const projectAssignment = await ProjectAssignment.findOne({ 
      projectId: task.projectId, 
      userId 
    });
    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not assigned to this project',
      });
    }

    // Check if user is assigned to this task
    const taskAssignment = await TaskAssignment.findOne({ taskId, userId });
    if (!taskAssignment && !projectAssignment.isTechLead) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not assigned to this task',
      });
    }

    // Validate status transition
    const validTransitions = {
      'todo': ['in_progress'],
      'in_progress': ['done', 'todo'],
      'done': ['in_progress'],
    };

    if (!validTransitions[task.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Status Transition',
        message: `Cannot transition from ${task.status} to ${status}`,
        allowedTransitions: validTransitions[task.status],
      });
    }

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        status,
        ...(status === 'in_progress' ? { startDate: new Date() } : {}),
        ...(status === 'done' ? { endDate: new Date() } : {}),
      },
      { new: true }
    )
    .populate('requiredSkills', 'name')
    .populate('createdBy', 'name email');

    // Get task assignees
    const assignees = await TaskAssignment.find({ taskId })
      .populate('userId', 'name email');

    // Format response
    const response = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      startDate: updatedTask.startDate,
      endDate: updatedTask.endDate,
      requiredSkills: updatedTask.requiredSkills.map(s => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: updatedTask.createdBy._id,
        name: updatedTask.createdBy.name,
        email: updatedTask.createdBy.email,
      },
      assignees: assignees.map(a => ({
        id: a.userId._id,
        name: a.userId.name,
        email: a.userId.email,
      })),
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    };

    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

// exports moved to bottom so all handlers are defined before export

const getStaffTasks = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    console.log('[getStaffTasks] requester token payload:', req.user);
    console.log('[getStaffTasks] resolved userId:', userId);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Find task assignments for this user and include task + project info
    const assignments = await TaskAssignment.find({ userId })
      .populate({
        path: 'taskId',
        populate: [
          { path: 'projectId', select: 'name' },
          { path: 'createdBy', select: 'name email' }
        ]
      })
      .lean();

    console.log('[getStaffTasks] assignments found:', assignments.length);

    const tasks = assignments.map(a => {
      const task = a.taskId || {};
      const project = task.projectId || {};
      return {
        assignmentId: a._id,
        taskId: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: project._id,
        projectName: project.name,
        startDate: task.startDate,
        endDate: task.endDate,
        createdBy: task.createdBy ? { id: task.createdBy._id, name: task.createdBy.name } : null,
        assignedAt: a.createdAt,
      };
    });

    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
};

module.exports = {
  getStaffProjects,         // DEV-61
  getStaffProjectDetail,    // DEV-62
  getProjectTasks,          // DEV-79
  updateTaskStatus,         // DEV-80
  getStaffTasks,            // DEV-81
};