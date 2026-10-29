import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isTokenBlacklisted } from '../utils/cacheManager.js';

// Protect routes - verify JWT token & check Redis revocation blacklist
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Check if token has been revoked / blacklisted in Redis
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked or logged out. Please log in again.',
        });
      }

      // 2. Verify JWT signature & expiration
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_bank_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: 'Account has been deactivated. Please contact support.' });
      }

      req.token = token;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Admin role check middleware
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};
