const userDto = require('../dto/user.dto');
const { User } = require('../models');
const { hashPassword } = require('../utils/password');

const createEmployee = async (req, res) => {
  const { password, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Email',
      message: 'User with this email already exists',
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = new User({
    ...req.body,
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({
      success: true,
      data: userDto.mapUserToUserResponse(newUser),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

module.exports = {
  createEmployee,
};
