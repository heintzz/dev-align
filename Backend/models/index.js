const mongoose = require("mongoose");
const userSchema = require("./schemas/user.schema");
const skillSchema = require("./schemas/skill.schema");
const positionSchema = require("./schemas/position.schema");
const menuSchema = require("./schemas/menu.schema");

const User = mongoose.model("User", userSchema);
const Skill = mongoose.model("Skill", skillSchema);
const Position = mongoose.model("Position", positionSchema);
const Menu = mongoose.model("Menu", menuSchema);

module.exports = {
  User,
  Skill,
  Position,
  Menu,
};
