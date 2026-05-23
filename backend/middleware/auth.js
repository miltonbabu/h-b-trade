const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin only - allows both 'admin' and 'super_admin' roles
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
};

// Super admin only - only allows 'super_admin' role
const superAdminOnly = (req, res, next) => {
  logger.info(`superAdminOnly check - user role: ${req.user?.role}, user: ${req.user?.email}`);
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    logger.warn(`Access denied for ${req.user?.email} - role: ${req.user?.role}`);
    res.status(403).json({ 
      error: 'Access denied. Super admin privileges required.' 
    });
  }
};

// Check if user can delete (only super_admin can delete)
const canDelete = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied. Only super admin can delete items.' 
    });
  }
};

const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({
      error: 'Access denied. Customer privileges required.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, adminOnly, superAdminOnly, canDelete, customerOnly, optionalAuth };
