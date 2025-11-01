const { Task } = require("../models");
const { TaskAssignment } = require("../models");
const { Column } = require("../models");

// const TaskLog = require("../models/TaskLog");
// const Project = require("../models/Project");
// const User = require("../models/User");
// const { sendEmail } = require("../utils/email");
const { ProjectAssignment } = require("../models/");

const createColumn = async (req, res) => {
  const { projectId, name, key, color } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Column name must be specified",
    });
  }

  try {
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: projectId,
      userId: req.user.id,
    });

    console.log(projectAssignment);

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Not authorized to add tasks to this project",
      });
    }

    if (projectAssignment.isTechLead === false) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Only Tech Leads can create tasks",
      });
    }

    if (!key) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message:
          "columnKey is required (e.g., 'backlog', 'in_progress', 'review', 'done')",
      });
    }

    const existingColumn = await Column.findOne({
      projectId,
      key: key,
    });

    if (existingColumn) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Column with key '${key}' already existed`,
      });
    }

    const maxOrderColumn = await Task.findOne({
      projectId,
    })
      .sort({ order: -1 })
      .select("order");

    const order = maxOrderColumn ? maxOrderColumn.order + 1 : 0;

    const column = await Column.create({
      projectId: projectId,
      key,
      name,
      order,
      color,
    });

    res.status(201).json({
      success: true,
      message: "Column created successfully",
      data: column,
    });
  } catch (err) {
    console.error("Create column error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getColumns = async (req, res) => {
  try {
    // console.log(req, res);
    // console.log(req.params.projectId);
    const { projectId } = req.query;
    console.log(projectId);
    const columns = await Column.find({ projectId });

    res.status(200).json({ success: true, data: columns });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const createTask = async (req, res) => {
  const {
    projectId,
    title,
    description,
    skills,
    status,
    deadline,
    assignedTo,
    columnKey,
  } = req.body;

  try {
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Task title is required",
      });
    }

    const projectAssignment = await ProjectAssignment.findOne({
      projectId: projectId,
      userId: req.user.id,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Not authorized to add tasks to this project",
      });
    }

    if (projectAssignment.isTechLead === false) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Only Tech Leads can create tasks",
      });
    }

    if (!columnKey) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message:
          "columnKey is required (e.g., 'backlog', 'in_progress', 'review', 'done')",
      });
    }

    const column = await Column.findOne({
      projectId,
      key: columnKey,
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Column with key '${columnKey}' not found`,
      });
    }

    const maxOrderTask = await Task.findOne({
      projectId,
      columnKey,
    })
      .sort({ order: -1 })
      .select("order");

    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      projectId: projectId,
      columnId: column._id,
      columnKey: columnKey,
      title,
      description,
      requiredSkills: skills,
      status: status || "todo",
      deadline: deadline ? new Date(deadline) : undefined,
      order: order,
      createdBy: req.user.id,
    });

    // if (assignedTo && assignedTo.length > 0) {
    //   const assignments = assignedTo.map((userId) => ({
    //     taskId: task._id,
    //     userId: userId,
    //   }));
    //   await TaskAssignment.insertMany(assignments);
    // }

    const populatedTask = await Task.findById(task._id)
      .populate("requiredSkills", "name")
      .populate("createdBy", "name email")
      .lean();

    let assignee = null;

    if (assignedTo && assignedTo.trim() !== "") {
      const assignment = new TaskAssignment({
        taskId: task._id,
        userId: assignedTo,
      });

      await assignment.save();

      assignee = await ProjectAssignment.findOne({
        projectId,
        userId: assignedTo,
      })
        .populate({
          path: "userId",
          select: "name email role position",
          populate: {
            path: "position",
            select: "_id name",
          },
        })
        .lean();
    }

    if (assignee?.userId) {
      populatedTask.assignee = {
        _id: assignee.userId._id,
        name: assignee.userId.name,
        email: assignee.userId.email,
        role: assignee.userId.role,
        position: assignee.userId.position,
      };
    } else {
      populatedTask.assignee = null;
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`project:${projectId}`).emit("task:created", {
        task: populatedTask,
        columnKey,
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    // console.log(req, res);
    // console.log(req.params.projectId);
    const { projectId } = req.query;
    // 1. Get all columns
    const columns = await Column.find({ projectId }).sort({ order: 1 });

    // 2. Get all tasks
    const tasks = await Task.find({ projectId })
      .populate("requiredSkills", "name")
      .populate("createdBy", "name email")
      .sort({ order: 1 });

    // 3. Get task assignments (optional)
    const taskIds = tasks.map((t) => t._id);
    const assignments = await TaskAssignment.find({
      taskId: { $in: taskIds },
    }).populate("userId", "name email");

    // 4. Map assignments to tasks
    const assignmentMap = {};
    assignments.forEach((assignment) => {
      const taskId = assignment.taskId.toString();
      if (!assignmentMap[taskId]) {
        assignmentMap[taskId] = [];
      }
      assignmentMap[taskId].push(assignment.userId);
    });

    // 5. Transform to frontend structure
    const columnsData = {};
    columns.forEach((col) => {
      columnsData[col.key] = {
        _id: col._id,
        name: col.name,
        order: col.order,
        color: col.color,
        tasks: tasks
          .filter((task) => task.columnKey === col.key)
          .map((task) => ({
            _id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            deadline: task.deadline,
            requiredSkills: task.requiredSkills,
            order: task.order,
            createdBy: task.createdBy,
            assignedUsers: assignmentMap[task._id.toString()] || [],
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          })),
      };
    });

    res.status(200).json({ success: true, data: columnsData });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const editTask = async (req, res) => {
  const {
    projectId,
    taskId,
    title,
    description,
    skills,
    status,
    deadline,
    assignedTo,
  } = req.body;

  try {
    const projectAssignment = await ProjectAssignment.findOne({
      projectId: projectId,
      userId: req.user.id,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
        message: "Not authorized to edit tasks to this project",
      });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Task with id '${taskId}' not found`,
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (deadline !== undefined)
      updates.deadline = deadline ? new Date(deadline) : null;
    if (skills !== undefined) updates.requiredSkills = skills;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("requiredSkills", "name")
      .populate("createdBy", "name email");

    if (assignedTo !== undefined && assignedTo && assignedTo.trim() !== "") {
      await TaskAssignment.deleteMany({ taskId });

      const assignment = new TaskAssignment({
        taskId: taskId,
        userId: assignedTo,
      });
      await assignment.save();
    }

    const assignments = await TaskAssignment.find({ taskId }).populate(
      "userId",
      "name email"
    );

    const taskWithAssignments = {
      ...updatedTask.toObject(),
      assignedUsers: assignments.map((a) => a.userId),
    };

    const io = req.app.get("io");
    if (io) {
      io.to(`project:${existingTask.projectId}`).emit("task:updated", {
        taskId,
        task: taskWithAssignments,
        columnKey: existingTask.columnKey,
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: taskWithAssignments,
    });
  } catch (err) {
    console.error("Edit task error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const moveTask = async (req, res) => {
  const { taskId, fromColumnKey, toColumnKey, fromIndex, toIndex } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    // console.log(task);
    const projectId = task.projectId;

    const projectAssignment = await ProjectAssignment.findOne({
      projectId: projectId,
      userId: req.user.id,
    });

    if (!projectAssignment) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to move tasks in this project",
      });
    }

    const session = await Task.startSession();
    session.startTransaction();

    try {
      if (fromColumnKey === toColumnKey) {
        if (fromIndex < toIndex) {
          await Task.updateMany(
            {
              projectId,
              columnKey: fromColumnKey,
              order: { $gt: fromIndex, $lte: toIndex },
            },
            { $inc: { order: -1 } },
            { session }
          );
        } else {
          await Task.updateMany(
            {
              projectId,
              columnKey: fromColumnKey,
              order: { $gte: toIndex, $lt: fromIndex },
            },
            { $inc: { order: 1 } },
            { session }
          );
        }
        task.order = toIndex;
      } else {
        const toColumn = await Column.findOne({
          projectId,
          key: toColumnKey,
        }).session(session);

        if (!toColumn) {
          throw new Error("Destination column not found");
        }

        // Decrease order in source column
        await Task.updateMany(
          {
            projectId,
            columnKey: fromColumnKey,
            order: { $gt: fromIndex },
          },
          { $inc: { order: -1 } },
          { session }
        );

        // Increase order in destination column
        await Task.updateMany(
          {
            projectId,
            columnKey: toColumnKey,
            order: { $gte: toIndex },
          },
          { $inc: { order: 1 } },
          { session }
        );

        task.columnKey = toColumnKey;
        task.columnId = toColumn._id;
        task.order = toIndex;
      }

      await task.save({ session });
      await session.commitTransaction();

      const io = req.app.get("io");
      if (io) {
        io.to(`project:${projectId}`).emit("task:moved", {
          taskId,
          fromColumnKey,
          toColumnKey,
          fromIndex,
          toIndex,
        });
      }

      res.json({
        success: true,
        message: "Task moved successfully",
        data: task,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("Move task error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  createColumn,
  getColumns,
  moveTask,
  editTask,
  //   updateTask,
  // updateTaskStatus,
};
