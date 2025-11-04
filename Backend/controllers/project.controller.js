const { Project, ProjectAssignment, User, Task, TaskAssignment } = require('../models');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Task-related functions moved from project-task.controller.js

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { title, description, requiredSkills, assigneeIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID format',
      });
    }

    // Check if user is assigned to this project
    const projectAssignment = await ProjectAssignment.findOne({
      projectId,
      userId,
      isTechLead: true,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only tech leads can create tasks',
      });
    }

    // Create task
    const task = await Task.create({
      projectId,
      title,
      description,
      requiredSkills,
      status: 'todo',
      createdBy: userId,
    });

    // If assignees provided, create task assignments
    if (assigneeIds && assigneeIds.length > 0) {
      // Verify all assignees are project members
      const projectMembers = await ProjectAssignment.find({
        projectId,
        userId: { $in: assigneeIds },
      });

      const validAssigneeIds = projectMembers.map((pm) => pm.userId.toString());
      const invalidAssigneeIds = assigneeIds.filter((id) => !validAssigneeIds.includes(id));

      if (invalidAssigneeIds.length > 0) {
        await Task.findByIdAndDelete(task._id);
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Some assignees are not project members',
          invalidAssigneeIds,
        });
      }

      // Create task assignments
      await TaskAssignment.insertMany(
        validAssigneeIds.map((userId) => ({
          taskId: task._id,
          userId,
        }))
      );
    }

    // Get populated task with assignees
    const populatedTask = await Task.findById(task._id)
      .populate('requiredSkills', 'name')
      .populate('createdBy', 'name email');

    const taskAssignments = await TaskAssignment.find({ taskId: task._id }).populate(
      'userId',
      'name email'
    );

    const response = {
      id: populatedTask._id,
      title: populatedTask.title,
      description: populatedTask.description,
      status: populatedTask.status,
      startDate: populatedTask.startDate,
      endDate: populatedTask.endDate,
      requiredSkills: populatedTask.requiredSkills.map((s) => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: populatedTask.createdBy._id,
        name: populatedTask.createdBy.name,
        email: populatedTask.createdBy.email,
      },
      assignees: taskAssignments.map((ta) => ({
        id: ta.userId._id,
        name: ta.userId.name,
        email: ta.userId.email,
      })),
      createdAt: populatedTask.createdAt,
      updatedAt: populatedTask.updatedAt,
    };

    return res.status(201).json({
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

const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId)
      .populate('requiredSkills', 'name')
      .populate('createdBy', 'name email');

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
      userId,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not assigned to this project',
      });
    }

    // Get task assignees
    const taskAssignments = await TaskAssignment.find({ taskId }).populate('userId', 'name email');

    const response = {
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      requiredSkills: task.requiredSkills.map((s) => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: task.createdBy._id,
        name: task.createdBy.name,
        email: task.createdBy.email,
      },
      assignees: taskAssignments.map((ta) => ({
        id: ta.userId._id,
        name: ta.userId.name,
        email: ta.userId.email,
      })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
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

const updateTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { title, description, requiredSkills } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // Check if user is tech lead
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: task.projectId,
      userId,
      isTechLead: true,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only tech leads can update task details',
      });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        requiredSkills,
      },
      { new: true }
    )
      .populate('requiredSkills', 'name')
      .populate('createdBy', 'name email');

    // Get task assignees
    const taskAssignments = await TaskAssignment.find({ taskId }).populate('userId', 'name email');

    const response = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      startDate: updatedTask.startDate,
      endDate: updatedTask.endDate,
      requiredSkills: updatedTask.requiredSkills.map((s) => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: updatedTask.createdBy._id,
        name: updatedTask.createdBy.name,
        email: updatedTask.createdBy.email,
      },
      assignees: taskAssignments.map((ta) => ({
        id: ta.userId._id,
        name: ta.userId.name,
        email: ta.userId.email,
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

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // Check if user is tech lead
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: task.projectId,
      userId,
      isTechLead: true,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only tech leads can delete tasks',
      });
    }

    // Delete task assignments first
    await TaskAssignment.deleteMany({ taskId });

    // Delete task
    await Task.findByIdAndDelete(taskId);

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const assignUsersToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { userIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // Check if user is tech lead
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: task.projectId,
      userId,
      isTechLead: true,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only tech leads can assign users to tasks',
      });
    }

    // Verify all users are project members
    const projectMembers = await ProjectAssignment.find({
      projectId: task.projectId,
      userId: { $in: userIds },
    });

    const validUserIds = projectMembers.map((pm) => pm.userId.toString());
    const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Some users are not project members',
        invalidUserIds,
      });
    }

    // Create task assignments
    await TaskAssignment.insertMany(
      validUserIds.map((userId) => ({
        taskId,
        userId,
      }))
    );

    // Get updated task with assignees
    const taskAssignments = await TaskAssignment.find({ taskId }).populate('userId', 'name email');

    return res.json({
      success: true,
      data: {
        taskId,
        assignees: taskAssignments.map((ta) => ({
          id: ta.userId._id,
          name: ta.userId.name,
          email: ta.userId.email,
        })),
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

const removeUserFromTask = async (req, res) => {
  try {
    const { taskId, userId: targetUserId } = req.params;
    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
      });
    }

    // Get task with project info
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    // Check if user is tech lead
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: task.projectId,
      userId,
      isTechLead: true,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only tech leads can remove users from tasks',
      });
    }

    // Remove task assignment
    await TaskAssignment.findOneAndDelete({
      taskId,
      userId: targetUserId,
    });

    return res.status(204).send();
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
        error: 'Invalid project ID format',
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
      taskId: { $in: tasks.map((t) => t._id) },
    }).populate('userId', 'name email');

    // Map tasks with assignments
    const mappedTasks = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      requiredSkills: task.requiredSkills.map((s) => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: task.createdBy._id,
        name: task.createdBy.name,
        email: task.createdBy.email,
      },
      assignees: taskAssignments
        .filter((ta) => ta.taskId.equals(task._id))
        .map((ta) => ({
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
        error: 'Invalid task ID format',
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
      userId,
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
      todo: ['in_progress'],
      in_progress: ['done', 'todo'],
      done: ['in_progress'],
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
    const assignees = await TaskAssignment.find({ taskId }).populate('userId', 'name email');

    // Format response
    const response = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      startDate: updatedTask.startDate,
      endDate: updatedTask.endDate,
      requiredSkills: updatedTask.requiredSkills.map((s) => ({
        id: s._id,
        name: s.name,
      })),
      createdBy: {
        id: updatedTask.createdBy._id,
        name: updatedTask.createdBy.name,
        email: updatedTask.createdBy.email,
      },
      assignees: assignees.map((a) => ({
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

const createProject = async (req, res) => {
  const { name, description, startDate, deadline, teamMemberCount } = req.body;

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
      status: 'active', // Auto-set to active
      createdBy: req.user.id, // Assuming user ID comes from auth middleware
    };

    if (startDate) projectData.startDate = startDate;
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

    // If user is staff, only show projects they are assigned to
    if (req.user.role === 'staff') {
      // Find all project assignments for this staff member
      const staffAssignments = await ProjectAssignment.find({ userId: req.user.id });
      const projectIds = staffAssignments.map((assignment) => assignment.projectId);
      filter._id = { $in: projectIds };
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
        .select(
          'name description status startDate deadline teamMemberCount createdBy createdAt updatedAt'
        ),
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
        .select(
          'name description status startDate deadline teamMemberCount createdBy createdAt updatedAt'
        ),
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

    const project = await Project.findById(projectId).populate('createdBy', 'name email');

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

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project details
    const project = await Project.findById(projectId).populate('createdBy', '_id name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get all project assignments with user details and populate position
    const assignments = await ProjectAssignment.find({ projectId: project._id }).populate({
      path: 'userId',
      select: '_id name email role position',
      populate: {
        path: 'position',
        select: '_id name',
      },
    });

    // Extract manager (project creator)
    const managerId = project.createdBy._id;

    // Extract all staff (all assigned users)
    const allStaffIds = assignments.map((assignment) => assignment.userId._id);

    // Extract tech leads (excluding manager, only staff with isTechLead = true)
    const techLeadStaff = assignments
      .filter(
        (assignment) =>
          assignment.isTechLead === true &&
          assignment.userId._id.toString() !== managerId.toString()
      )
      .map((assignment) => assignment.userId._id);

    return res.status(200).json({
      success: true,
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          startDate: project.startDate,
          deadline: project.deadline,
          teamMemberCount: project.teamMemberCount,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        managerId: managerId,
        allStaffIds: allStaffIds,
        techLeadStaffIds: techLeadStaff,
        // Additional detailed information
        managerDetails: project.createdBy,
        staffDetails: assignments.map((assignment) => ({
          _id: assignment.userId._id,
          name: assignment.userId.name,
          email: assignment.userId.email,
          role: assignment.userId.role,
          position: assignment.userId.position
            ? {
                _id: assignment.userId.position._id,
                name: assignment.userId.position.name,
              }
            : null,
          isTechLead: assignment.isTechLead,
        })),
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

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, deadline, addStaffIds, removeStaffIds, replaceStaffIds } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    const messages = [];

    // Update basic fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;

    // Handle staff replacements (complete replacement of all staff)
    if (replaceStaffIds && Array.isArray(replaceStaffIds)) {
      // Verify all replacement staff exist
      const replacementStaff = await User.find({ _id: { $in: replaceStaffIds } });

      if (replacementStaff.length !== replaceStaffIds.length) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'One or more replacement staff members not found',
        });
      }

      // Remove all existing assignments
      await ProjectAssignment.deleteMany({ projectId: project._id });

      // Remove all task assignments for this project
      const projectTasks = await Task.find({ projectId: project._id });
      const taskIds = projectTasks.map((task) => task._id);
      await TaskAssignment.deleteMany({ taskId: { $in: taskIds } });

      // Create new assignments for replacement staff
      for (const staffMember of replacementStaff) {
        await ProjectAssignment.create({
          projectId: project._id,
          userId: staffMember._id,
          isTechLead: staffMember.role === 'manager',
        });
      }

      project.teamMemberCount = replaceStaffIds.length + 1; // +1 for manager
      messages.push(`All staff replaced with ${replaceStaffIds.length} new members`);
    } else {
      // Handle individual staff additions
      if (addStaffIds && Array.isArray(addStaffIds) && addStaffIds.length > 0) {
        const { sendNotification } = require('../services/notification.service');
        const staffToAdd = await User.find({ _id: { $in: addStaffIds } });

        if (staffToAdd.length !== addStaffIds.length) {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'One or more staff members to add not found',
          });
        }

        // Check for existing assignments
        const existingAssignments = await ProjectAssignment.find({
          projectId: project._id,
          userId: { $in: addStaffIds },
        });

        const existingUserIds = existingAssignments.map((a) => a.userId.toString());
        const newStaff = staffToAdd.filter((s) => !existingUserIds.includes(s._id.toString()));

        for (const staffMember of newStaff) {
          await ProjectAssignment.create({
            projectId: project._id,
            userId: staffMember._id,
            isTechLead: staffMember.role === 'manager',
          });

          // Notify the staff member about assignment
          await sendNotification({
            user: staffMember,
            title: 'Added to Project',
            message: `You have been added to the project "${project.name}".`,
            type: 'announcement',
            relatedProject: project._id,
          });
        }

        project.teamMemberCount += newStaff.length;
        messages.push(`Added ${newStaff.length} new staff members`);
      }

      // Handle staff removals
      if (removeStaffIds && Array.isArray(removeStaffIds) && removeStaffIds.length > 0) {
        const { sendNotification } = require('../services/notification.service');

        // Get staff details before removal for notifications
        const removedStaff = await User.find({ _id: { $in: removeStaffIds } });

        // Remove project assignments
        const removeResult = await ProjectAssignment.deleteMany({
          projectId: project._id,
          userId: { $in: removeStaffIds },
        });

        // Remove task assignments for removed users
        const projectTasks = await Task.find({ projectId: project._id });
        const taskIds = projectTasks.map((task) => task._id);
        await TaskAssignment.deleteMany({
          taskId: { $in: taskIds },
          userId: { $in: removeStaffIds },
        });

        // Notify removed staff members
        for (const staffMember of removedStaff) {
          await sendNotification({
            user: staffMember,
            title: 'Removed from Project',
            message: `You have been removed from the project "${project.name}".`,
            type: 'announcement',
            relatedProject: project._id,
          });
        }

        project.teamMemberCount = Math.max(1, project.teamMemberCount - removeResult.deletedCount);
        messages.push(`Removed ${removeResult.deletedCount} staff members from project and tasks`);
      }
    }

    // Handle status change to 'completed' - transfer skills to users
    if (status !== undefined && status === 'completed' && project.status === 'active') {
      const { sendNotification } = require('../services/notification.service');

      // Get all tasks for this project (only in_progress or done - exclude todo)
      const tasks = await Task.find({
        projectId: project._id,
        status: { $in: ['in_progress', 'done'] },
      }).populate('requiredSkills');

      // Get all task assignments for these tasks
      const taskIds = tasks.map((task) => task._id);
      const taskAssignments = await TaskAssignment.find({ taskId: { $in: taskIds } }).populate(
        'userId'
      );

      // Map of userId to set of skill IDs
      const userSkillsMap = new Map();

      for (const assignment of taskAssignments) {
        const task = tasks.find((t) => t._id.toString() === assignment.taskId.toString());
        if (task && task.requiredSkills && task.requiredSkills.length > 0) {
          const userId = assignment.userId._id.toString();

          if (!userSkillsMap.has(userId)) {
            // Get user's existing skills
            const user = await User.findById(userId);
            const existingSkills = user.skills || [];
            userSkillsMap.set(userId, new Set(existingSkills.map((s) => s.toString())));
          }

          // Add task's required skills to user's skill set (Set prevents duplicates)
          const userSkills = userSkillsMap.get(userId);
          task.requiredSkills.forEach((skill) => {
            userSkills.add(skill._id.toString());
          });
        }
      }

      // Update all users with their new skills
      let usersUpdated = 0;
      for (const [userId, skillSet] of userSkillsMap.entries()) {
        const skillArray = Array.from(skillSet);
        await User.findByIdAndUpdate(userId, { skills: skillArray });
        usersUpdated++;
      }

      project.status = 'completed';
      messages.push(
        `Project completed. Transferred skills from ${tasks.length} task(s) to ${usersUpdated} user(s)`
      );

      // Notify all team members about project completion
      const teamAssignments = await ProjectAssignment.find({ projectId: project._id }).populate(
        'userId',
        'name email'
      );
      for (const assignment of teamAssignments) {
        await sendNotification({
          user: assignment.userId,
          title: 'Project Completed',
          message: `The project "${project.name}" has been marked as completed. Your task skills have been transferred to your profile.`,
          type: 'announcement',
          relatedProject: project._id,
        });
      }

      // Notify HR about project completion
      const hrUsers = await User.find({ role: 'hr' });
      for (const hrUser of hrUsers) {
        await sendNotification({
          user: hrUser,
          title: 'Project Completed',
          message: `The project "${project.name}" has been completed. Skills from ${tasks.length} task(s) have been transferred to ${usersUpdated} team member(s).`,
          type: 'announcement',
          relatedProject: project._id,
        });
      }

      try {
        await fetch(`${process.env.BASE_AI_URL}/project-embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: project._id,
          }),
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          error: 'Failed to generate project embeddings',
        });
      }
    } else if (status !== undefined) {
      project.status = status;
    }

    await project.save();

    // Get updated project with populated data
    const updatedProject = await Project.findById(project._id).populate(
      'createdBy',
      'name email role'
    );

    return res.status(200).json({
      success: true,
      data: updatedProject,
      message: messages.join('. '),
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
    const { sendNotification } = require('../services/notification.service');

    const project = await Project.findById(projectId).populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get all team members before deletion to send notifications
    const teamAssignments = await ProjectAssignment.find({ projectId: project._id }).populate(
      'userId',
      'name email'
    );
    const teamMembers = teamAssignments.map((a) => a.userId);

    // Get HR users
    const hrUsers = await User.find({ role: 'hr' });

    // Cascade delete: Find all tasks for this project
    const tasks = await Task.find({ projectId: project._id });
    const taskIds = tasks.map((task) => task._id);

    // Delete all task assignments for these tasks
    await TaskAssignment.deleteMany({ taskId: { $in: taskIds } });

    // Delete all tasks for this project
    await Task.deleteMany({ projectId: project._id });

    // Delete all project assignments
    await ProjectAssignment.deleteMany({ projectId: project._id });

    // Delete all borrow requests related to this project
    const { BorrowRequest } = require('../models');
    await BorrowRequest.deleteMany({ projectId: project._id });

    // Delete the project itself
    await project.deleteOne();

    // Send notifications to all team members
    for (const member of teamMembers) {
      await sendNotification({
        user: member,
        title: 'Project Deleted',
        message: `The project "${project.name}" has been deleted by ${project.createdBy.name}. All associated tasks and assignments have been removed.`,
        type: 'announcement',
        relatedProject: null, // Project is deleted, so no reference
      });
    }

    // Send notifications to HR
    for (const hrUser of hrUsers) {
      await sendNotification({
        user: hrUser,
        title: 'Project Deleted',
        message: `The project "${project.name}" created by ${project.createdBy.name} has been deleted. ${teamMembers.length} team member(s) were affected.`,
        type: 'announcement',
        relatedProject: null,
      });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const createProjectWithAssignments = async (req, res) => {
  const { name, description, startDate, deadline, staffIds } = req.body;
  const { sendNotification } = require('../services/notification.service');
  const { BorrowRequest } = require('../models');

  // Validation
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

  if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'At least one staff member must be assigned to the project',
    });
  }

  try {
    // Verify all staff members exist and get their data
    const staff = await User.find({ _id: { $in: staffIds } }).populate('managerId', 'name email');

    if (staff.length !== staffIds.length) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'One or more staff members not found',
      });
    }

    // Get project creator details
    const projectCreator = await User.findById(req.user.id);

    // Create project
    const projectData = {
      name,
      description,
      status: 'active', // Auto-set to active
      createdBy: req.user.id,
      teamMemberCount: 1, // Start with just manager, will increment as staff are approved
    };

    if (startDate) projectData.startDate = startDate;
    if (deadline) projectData.deadline = deadline;

    const project = await Project.create(projectData);

    // IMPORTANT: Automatically assign the project creator (manager) as tech lead
    const creatorAssignment = await ProjectAssignment.create({
      projectId: project._id,
      userId: req.user.id,
      isTechLead: true, // Creator is automatically the tech lead
    });

    // Categorize staff: own staff vs need approval
    const ownStaff = [];
    const needApprovalStaff = [];

    for (const staffMember of staff) {
      // Check if this staff is a direct subordinate (managerId matches creator's ID)
      if (staffMember.managerId && staffMember.managerId._id.toString() === req.user.id) {
        ownStaff.push(staffMember);
      } else {
        needApprovalStaff.push(staffMember);
      }
    }

    // Create assignments for own staff (direct subordinates)
    const assignments = [creatorAssignment]; // Include creator assignment
    for (const staffMember of ownStaff) {
      const assignmentData = {
        projectId: project._id,
        userId: staffMember._id,
        isTechLead: staffMember.role === 'manager',
      };

      const assignment = await ProjectAssignment.create(assignmentData);
      assignments.push(assignment);

      // Notify staff about assignment
      await sendNotification({
        user: staffMember,
        title: 'New Project Assignment',
        message: `You have been assigned to the project "${name}". Your manager ${projectCreator.name} has created this project.`,
        type: 'announcement',
        relatedProject: project._id,
      });
    }

    // Update team member count to include creator + assigned staff
    project.teamMemberCount = 1 + ownStaff.length; // Creator + own staff
    await project.save();

    // Create borrow requests for staff that need approval
    const borrowRequests = [];
    for (const staffMember of needApprovalStaff) {
      if (!staffMember.managerId) {
        // Skip if staff has no manager assigned
        continue;
      }

      const borrowRequest = await BorrowRequest.create({
        projectId: project._id,
        staffId: staffMember._id,
        requestedBy: req.user.id,
        approvedBy: staffMember.managerId._id,
        isApproved: null, // null = pending
      });

      borrowRequests.push(borrowRequest);

      // Notify the staff's manager about approval request
      await sendNotification({
        user: staffMember.managerId,
        title: 'Staff Assignment Approval Required',
        message: `${projectCreator.name} wants to assign your team member ${staffMember.name} to the project "${name}". Please review and respond to this request.`,
        type: 'project_approval',
        relatedProject: project._id,
        relatedBorrowRequest: borrowRequest._id,
      });

      // Notify the staff that they're pending approval
      await sendNotification({
        user: staffMember,
        title: 'Pending Project Assignment',
        message: `You have been nominated for the project "${name}" by ${projectCreator.name}. Waiting for approval from your manager.`,
        type: 'announcement',
        relatedProject: project._id,
      });
    }

    // Get HR users to notify
    const hrUsers = await User.find({ role: 'hr' });

    // Notify HR about new project
    for (const hrUser of hrUsers) {
      await sendNotification({
        user: hrUser,
        title: 'New Project Created',
        message: `${projectCreator.name} has created a new project: "${name}". ${ownStaff.length} staff member(s) assigned, ${needApprovalStaff.length} pending approval.`,
        type: 'announcement',
        relatedProject: project._id,
      });
    }

    // Populate project and assignments for response
    const populatedProject = await Project.findById(project._id).populate(
      'createdBy',
      'name email role'
    );

    const populatedAssignments = await ProjectAssignment.find({
      projectId: project._id,
    })
      .populate({
        path: 'userId',
        select: 'name email role position',
        populate: {
          path: 'position',
          select: '_id name',
        },
      })
      .populate('projectId', 'name description status');

    return res.status(201).json({
      success: true,
      data: {
        project: populatedProject,
        assignments: populatedAssignments,
        borrowRequests: borrowRequests.length,
        message: `Project created successfully. ${ownStaff.length} staff member(s) assigned immediately. ${needApprovalStaff.length} staff member(s) pending manager approval.`,
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

const assignTechLead = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { staffId, isTechLead } = req.body;

    // Validate required fields
    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Staff ID must be specified',
      });
    }

    if (typeof isTechLead !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'isTechLead must be a boolean value',
      });
    }

    // Get project details
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get the staff assignment
    const staffAssignment = await ProjectAssignment.findOne({
      projectId: project._id,
      userId: staffId,
    }).populate('userId', 'role');

    if (!staffAssignment) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Staff is not assigned to this project',
      });
    }

    // Prevent changing tech lead status of managers
    if (staffAssignment.userId.role === 'manager') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Cannot change tech lead status of a manager. Managers are always tech leads.',
      });
    }

    // If setting to true, check tech lead limits
    if (isTechLead === true) {
      // Count current tech leads (excluding managers)
      const allAssignments = await ProjectAssignment.find({
        projectId: project._id,
      }).populate('userId', 'role');

      const currentTechLeads = allAssignments.filter(
        (assignment) => assignment.isTechLead === true && assignment.userId.role !== 'manager'
      );

      // Maximum 1 staff can be tech lead (manager is always tech lead, so max 2 total)
      if (currentTechLeads.length >= 1) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message:
            'Maximum tech lead limit reached. A project can have maximum 2 tech leads (1 manager + 1 staff). Please remove existing staff tech lead first.',
        });
      }
    }

    // Update the tech lead status
    staffAssignment.isTechLead = isTechLead;
    await staffAssignment.save();

    // Get updated assignment with populated data
    const updatedAssignment = await ProjectAssignment.findById(staffAssignment._id)
      .populate({
        path: 'userId',
        select: 'name email role position',
        populate: {
          path: 'position',
          select: '_id name',
        },
      })
      .populate('projectId', 'name description status');

    return res.status(200).json({
      success: true,
      data: updatedAssignment,
      message: isTechLead
        ? 'Staff successfully assigned as tech lead'
        : 'Tech lead status removed from staff',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

/**
 * Get all staff assigned to a specific project
 * Returns user ID and name for easy task assignment
 */
const getProjectStaff = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid project ID format',
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get all project assignments with user details
    const assignments = await ProjectAssignment.find({ projectId })
      .populate('userId', '_id name email role')
      .sort({ 'userId.name': 1 });

    // Format response with just id and name
    const staff = assignments.map((assignment) => ({
      id: assignment.userId._id,
      name: assignment.userId.name,
      email: assignment.userId.email,
      role: assignment.userId.role,
      isTechLead: assignment.isTechLead,
    }));

    return res.status(200).json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        totalStaff: staff.length,
        staff,
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

module.exports = {
  createProject,
  createProjectWithAssignments,
  getProjects,
  getAllProjects,
  getProjectById,
  getProjectDetails,
  updateProject,
  deleteProject,
  assignTechLead,
  getProjectStaff,
  // Task Management
  getProjectTasks, // DEV-79
  updateTaskStatus, // DEV-80
  createTask,
  getTaskDetails,
  updateTaskDetails,
  deleteTask,
  assignUsersToTask,
  removeUserFromTask,
};
