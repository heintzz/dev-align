const { Project, ProjectAssignment, User, Task, TaskAssignment } = require('../models');
const mongoose = require('mongoose');

// Task-related functions moved from project-task.controller.js
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
      'backlog': ['in_progress'],
      'in_progress': ['review', 'backlog'],
      'review': ['done', 'in_progress'],
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
      const projectIds = staffAssignments.map(assignment => assignment.projectId);
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
        .select('name description status startDate deadline teamMemberCount createdBy createdAt updatedAt'),
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
        .select('name description status startDate deadline teamMemberCount createdBy createdAt updatedAt'),
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

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project details
    const project = await Project.findById(projectId)
      .populate('createdBy', '_id name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Get all project assignments with user details and populate position
    const assignments = await ProjectAssignment.find({ projectId: project._id })
      .populate({
        path: 'userId',
        select: '_id name email role position',
        populate: {
          path: 'position',
          select: '_id name'
        }
      });

    // Extract manager (project creator)
    const managerId = project.createdBy._id;

    // Extract all staff (all assigned users)
    const allStaffIds = assignments.map(assignment => assignment.userId._id);

    // Extract tech leads (excluding manager, only staff with isTechLead = true)
    const techLeadStaff = assignments
      .filter(assignment =>
        assignment.isTechLead === true &&
        assignment.userId._id.toString() !== managerId.toString()
      )
      .map(assignment => assignment.userId._id);

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
        staffDetails: assignments.map(assignment => ({
          _id: assignment.userId._id,
          name: assignment.userId.name,
          email: assignment.userId.email,
          role: assignment.userId.role,
          position: assignment.userId.position ? {
            _id: assignment.userId.position._id,
            name: assignment.userId.position.name
          } : null,
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
    const { name, description, status, deadline, addStaffIds, removeStaffIds, replaceStaffIds } = req.body;

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
      const taskIds = projectTasks.map(task => task._id);
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
          userId: { $in: addStaffIds }
        });

        const existingUserIds = existingAssignments.map(a => a.userId.toString());
        const newStaff = staffToAdd.filter(s => !existingUserIds.includes(s._id.toString()));

        for (const staffMember of newStaff) {
          await ProjectAssignment.create({
            projectId: project._id,
            userId: staffMember._id,
            isTechLead: staffMember.role === 'manager',
          });
        }

        project.teamMemberCount += newStaff.length;
        messages.push(`Added ${newStaff.length} new staff members`);
      }

      // Handle staff removals
      if (removeStaffIds && Array.isArray(removeStaffIds) && removeStaffIds.length > 0) {
        // Remove project assignments
        const removeResult = await ProjectAssignment.deleteMany({
          projectId: project._id,
          userId: { $in: removeStaffIds }
        });

        // Remove task assignments for removed users
        const projectTasks = await Task.find({ projectId: project._id });
        const taskIds = projectTasks.map(task => task._id);
        await TaskAssignment.deleteMany({
          taskId: { $in: taskIds },
          userId: { $in: removeStaffIds }
        });

        project.teamMemberCount = Math.max(1, project.teamMemberCount - removeResult.deletedCount);
        messages.push(`Removed ${removeResult.deletedCount} staff members from project and tasks`);
      }
    }

    // Handle status change to 'completed' - transfer skills to users
    if (status !== undefined && status === 'completed' && project.status === 'active') {
      // Get all tasks for this project
      const tasks = await Task.find({ projectId: project._id }).populate('requiredSkills');

      // Get all task assignments for this project
      const taskIds = tasks.map(task => task._id);
      const taskAssignments = await TaskAssignment.find({ taskId: { $in: taskIds } }).populate('userId');

      // Map of userId to set of skill IDs
      const userSkillsMap = new Map();

      for (const assignment of taskAssignments) {
        const task = tasks.find(t => t._id.toString() === assignment.taskId.toString());
        if (task && task.requiredSkills && task.requiredSkills.length > 0) {
          const userId = assignment.userId._id.toString();

          if (!userSkillsMap.has(userId)) {
            // Get user's existing skills
            const user = await User.findById(userId);
            const existingSkills = user.skills || [];
            userSkillsMap.set(userId, new Set(existingSkills.map(s => s.toString())));
          }

          // Add task's required skills to user's skill set (Set prevents duplicates)
          const userSkills = userSkillsMap.get(userId);
          task.requiredSkills.forEach(skill => {
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
      messages.push(`Project completed. Transferred skills to ${usersUpdated} users`);
    } else if (status !== undefined) {
      project.status = status;
    }

    await project.save();

    // Get updated project with populated data
    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role');

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

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    // Cascade delete: Find all tasks for this project
    const tasks = await Task.find({ projectId: project._id });
    const taskIds = tasks.map(task => task._id);

    // Delete all task assignments for these tasks
    await TaskAssignment.deleteMany({ taskId: { $in: taskIds } });

    // Delete all tasks for this project
    await Task.deleteMany({ projectId: project._id });

    // Delete all project assignments
    await ProjectAssignment.deleteMany({ projectId: project._id });

    // Delete the project itself
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

const createProjectWithAssignments = async (req, res) => {
  const { name, description, startDate, deadline, staffIds } = req.body;

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
    // Verify all staff members exist
    const staff = await User.find({ _id: { $in: staffIds } });

    if (staff.length !== staffIds.length) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'One or more staff members not found',
      });
    }

    // Create project
    const projectData = {
      name,
      description,
      status: 'active', // Auto-set to active
      createdBy: req.user.id,
      teamMemberCount: staffIds.length + 1, // Include manager in count
    };

    if (startDate) projectData.startDate = startDate;
    if (deadline) projectData.deadline = deadline;

    const project = await Project.create(projectData);

    // Create assignments for all staff members
    const assignments = [];
    for (const staffMember of staff) {
      const assignmentData = {
        projectId: project._id,
        userId: staffMember._id,
        // Automatically set isTechLead to true if user is a manager
        isTechLead: staffMember.role === 'manager',
      };

      const assignment = await ProjectAssignment.create(assignmentData);
      assignments.push(assignment);
    }

    // Populate project and assignments for response
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role');

    const populatedAssignments = await ProjectAssignment.find({
      projectId: project._id
    })
      .populate({
        path: 'userId',
        select: 'name email role position',
        populate: {
          path: 'position',
          select: '_id name'
        }
      })
      .populate('projectId', 'name description status');

    return res.status(201).json({
      success: true,
      data: {
        project: populatedProject,
        assignments: populatedAssignments,
        message: `Project created successfully with ${assignments.length} staff members assigned`,
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
        assignment =>
          assignment.isTechLead === true &&
          assignment.userId.role !== 'manager'
      );

      // Maximum 1 staff can be tech lead (manager is always tech lead, so max 2 total)
      if (currentTechLeads.length >= 1) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Maximum tech lead limit reached. A project can have maximum 2 tech leads (1 manager + 1 staff). Please remove existing staff tech lead first.',
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
          select: '_id name'
        }
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
  getProjectTasks,    // Added for DEV-79
  updateTaskStatus,   // Added for DEV-80
};
