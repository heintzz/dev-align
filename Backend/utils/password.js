const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

module.exports = {
  hashPassword,
  comparePassword,
  generatePassword,
};
