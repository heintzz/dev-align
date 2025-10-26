const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: No Token Provided',
    });
  }
  try {
    const secretKey = process.env.JWT_SECRET || 'secret_key';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Invalid or Expired Token',
    });
  }
};

module.exports = verifyToken;
