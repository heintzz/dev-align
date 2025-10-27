const mongoose = require("mongoose");
const userSchema = require("./schemas/user.schema");
const skillSchema = require("./schemas/skill.schema");
const positionSchema = require("./schemas/position.schema");
const menuSchema = require("./schemas/menu.schema");
const tokenSchema = require("./schemas/token.schema");

const User = mongoose.model("User", userSchema);
const Skill = mongoose.model("Skill", skillSchema);
const Position = mongoose.model("Position", positionSchema);
const Menu = mongoose.model("Menu", menuSchema);
const Token = mongoose.model("Token", tokenSchema);

module.exports = {
  User,
  Skill,
  Position,
  Menu,
  Token,
};
