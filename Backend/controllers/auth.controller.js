const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Not Found',
        message: 'User not found with this email',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        id: user._id,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

module.exports = { userLogin };
