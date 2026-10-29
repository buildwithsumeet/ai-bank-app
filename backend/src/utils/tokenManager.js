import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storeRefreshToken } from './cacheManager.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_apex_bank_jwt_key_2026_super_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_key`;

// Access Token Lifetime: 15 Minutes
const ACCESS_TOKEN_EXPIRY = '15m';
// Refresh Token Lifetime: 7 Days
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id: userId,
      role: user.role || 'customer',
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate a long-lived refresh token and persist in Redis
 */
export const generateRefreshToken = async (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  const tokenId = crypto.randomUUID();

  const refreshToken = jwt.sign(
    {
      id: userId,
      role: user.role || 'customer',
      type: 'refresh',
      jti: tokenId,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store in Redis (7 days = 604800 seconds)
  await storeRefreshToken(userId, refreshToken, 7 * 24 * 3600);

  return refreshToken;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    token: accessToken, // Backwards compatibility for existing clients & test suites
  };
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    // Also try standard secret in case of single-secret setups
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
};
