// Admin middleware - checks if user is an admin
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // User should already be authenticated by auth middleware
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }

  next();
};
