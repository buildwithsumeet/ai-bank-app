import { redisClient, getRedisStatus } from '../config/redis.js';

/**
 * Universal Cache & Token Blacklist Manager for Redis
 * Includes automatic fallbacks when Redis is in offline mode
 */

// Cache Get with JSON parsing
export const cacheGet = async (key) => {
  if (!getRedisStatus()) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Cache Warning]: Failed to get key ${key}: ${err.message}`);
    return null;
  }
};

// Cache Set with TTL in seconds
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!getRedisStatus()) return false;
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[Cache Warning]: Failed to set key ${key}: ${err.message}`);
    return false;
  }
};

// Cache Delete
export const cacheDel = async (key) => {
  if (!getRedisStatus()) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn(`[Cache Warning]: Failed to delete key ${key}: ${err.message}`);
    return false;
  }
};

// Invalidate all keys matching a pattern (e.g. "user:profile:*")
export const cacheDelPattern = async (pattern) => {
  if (!getRedisStatus()) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (err) {
    console.warn(`[Cache Warning]: Failed to delete pattern ${pattern}: ${err.message}`);
    return false;
  }
};

// Invalidate User Specific Caches (Profile, Accounts, Analytics)
export const invalidateUserCache = async (userId) => {
  if (!userId) return;
  const uid = userId.toString();
  await Promise.all([
    cacheDel(`user:profile:${uid}`),
    cacheDel(`user:accounts:${uid}`),
    cacheDel(`analytics:${uid}`),
  ]);
};

// Invalidate Admin System Metrics Cache
export const invalidateAdminCache = async () => {
  await Promise.all([
    cacheDel('admin:metrics'),
    cacheDel('admin:users:list'),
  ]);
};

// Blacklist a JWT token (stores token in Redis with TTL until expiry)
export const blacklistToken = async (token, expSeconds = 900) => {
  if (!getRedisStatus() || !token) return false;
  try {
    await redisClient.setex(`blacklist:token:${token}`, expSeconds, 'revoked');
    return true;
  } catch (err) {
    console.warn(`[Blacklist Warning]: Failed to blacklist token: ${err.message}`);
    return false;
  }
};

// Check if a token is in the Redis blacklist
export const isTokenBlacklisted = async (token) => {
  if (!getRedisStatus() || !token) return false;
  try {
    const res = await redisClient.get(`blacklist:token:${token}`);
    return res === 'revoked';
  } catch (err) {
    return false;
  }
};

// Store Refresh Token in Redis
export const storeRefreshToken = async (userId, refreshToken, ttlSeconds = 7 * 24 * 3600) => {
  if (!getRedisStatus()) return false;
  try {
    await redisClient.setex(`refresh:token:${refreshToken}`, ttlSeconds, userId.toString());
    return true;
  } catch (err) {
    console.warn(`[RefreshToken Warning]: Failed to store refresh token: ${err.message}`);
    return false;
  }
};

// Validate & Consume / Rotate Refresh Token in Redis
export const verifyStoredRefreshToken = async (refreshToken) => {
  if (!getRedisStatus()) return null;
  try {
    const userId = await redisClient.get(`refresh:token:${refreshToken}`);
    return userId || null;
  } catch (err) {
    return null;
  }
};

// Remove Refresh Token from Redis
export const revokeRefreshToken = async (refreshToken) => {
  if (!getRedisStatus() || !refreshToken) return false;
  try {
    await redisClient.del(`refresh:token:${refreshToken}`);
    return true;
  } catch (err) {
    return false;
  }
};
