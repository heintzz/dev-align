const mongoose = require("mongoose");
const userSchema = require("./schemas/user.schema");
const skillSchema = require("./schemas/skill.schema");
const positionSchema = require("./schemas/position.schema");
const menuSchema = require("./schemas/menu.schema");
const tokenSchema = require("./schemas/token.schema");
const projectSchema = require("./schemas/project.schema");
const projectAssignmentSchema = require("./schemas/project-assignments.schema");
const taskSchema = require("./schemas/task.schema");
const taskAssignmentSchema = require("./schemas/task-assignments");

const User = mongoose.model("User", userSchema);
const Skill = mongoose.model("Skill", skillSchema);
const Position = mongoose.model("Position", positionSchema);
const Menu = mongoose.model("Menu", menuSchema);
const Token = mongoose.model("Token", tokenSchema);
const Project = mongoose.model("Project", projectSchema);
const ProjectAssignment = mongoose.model("ProjectAssignment", projectAssignmentSchema);
const Task = mongoose.model("Task", taskSchema);
const TaskAssignment = mongoose.model("TaskAssignment", taskAssignmentSchema);

module.exports = {
  User,
  Skill,
  Position,
  Menu,
  Token,
  Project,
  ProjectAssignment,
  Task,
  TaskAssignment,
};
