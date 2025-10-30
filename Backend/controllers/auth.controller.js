const { User, Token } = require("../models");
const { sendEmail } = require("../utils/email");
const { generateToken } = require("../utils/jwt");
const { comparePassword } = require("../utils/password");
const dotenv = require("dotenv");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Not Found",
        message: "User not found with this email",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid Credentials",
        message: "Email or password is incorrect",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      data: {
        id: user._id,
        role: user.role,
        token: token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const token = await Token.findOne({ userId: user._id }); // ← Perbaiki ini
    if (token) {
      await token.deleteOne(); // ← Perbaiki ini juga
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashToken = await bcrypt.hash(resetToken, 10);

    await Token.create({ userId: user._id, token: hashToken, createdAt: Date.now() });
    const link = `${CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`; // ← Sesuaikan URL

    const message = `
  <div>
    <p>Hi ${user.name}</p>
    <p>You requested to reset your password.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${link}">Reset Password</a>
  </div>
`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: message,
    });

    // ← Tambahkan return response
    return res.json({
      success: true,
      message: 'Password reset link has been sent to your email',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, token, password, confirmPassword } = req.body;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      });
    }

    const passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Token not found",
      });
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid Token",
        message: "Invalid or expired password reset token",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password Mismatch",
        message: "Password and confirm password do not match",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();
    await passwordResetToken.deleteOne();

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: req.user.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid Credentials",
        message: "Current password is incorrect",
      });
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

module.exports = {
  userLogin,
  requestResetPassword,
  resetPassword,
  updatePassword,
};
