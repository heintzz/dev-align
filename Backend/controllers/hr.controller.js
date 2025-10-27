const userDto = require('../dto/user.dto');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const { hashPassword, generatePassword } = require('../utils/password');

const createEmployee = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Email',
      message: 'User with this email already exists',
    });
  }

  const password = generatePassword();
  const hashedPassword = await hashPassword(password);

  const user = new User({
    ...req.body,
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();

    const message = `Hello ${req.body.name}, Welcome onboard!!
Your HR has created an account for you.
Email: ${email}
Password: ${password}
Please log in and change your password.
    `;

    // TODO: check email validation before sending
    await sendEmail({
      to: email,
      subject: 'Account Created - DevAlign HRIS',
      text: message,
    });

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
