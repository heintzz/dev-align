const mongoose = require('mongoose');
const userSchema = require('./schemas/user.schema');
const skillSchema = require('./schemas/skill.schema');

const User = mongoose.model('User', userSchema);
const Skill = mongoose.model('Skill', skillSchema);

module.exports = {
  User,
  Skill,
};
