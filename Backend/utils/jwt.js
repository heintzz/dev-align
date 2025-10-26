const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET || 'secret_key';

  const options = {
    expiresIn: '1h',
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = { generateToken };
