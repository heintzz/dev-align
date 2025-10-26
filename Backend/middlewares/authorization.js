const auth = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Access Denied: You do not have permission to access this resource',
      });
    }
    next();
  };
};

module.exports = auth;
