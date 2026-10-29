import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let isRedisConnected = false;

export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  retryStrategy: (times) => {
    // Retry connection every 2s, max 10 retries before backing off
    if (times > 10) {
      return 5000;
    }
    return Math.min(times * 200, 2000);
  },
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false, // Don't hang requests if Redis is offline
  lazyConnect: true,
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log(`⚡ [Redis Connected]: In-Memory Cache running on ${REDIS_HOST}:${REDIS_PORT}`);
});

redisClient.on('ready', () => {
  isRedisConnected = true;
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Graceful log without crash
  console.warn(`⚠️ [Redis Warning]: Cache connection issue (${err.message}). Falling back to primary DB.`);
});

redisClient.on('close', () => {
  isRedisConnected = false;
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err) {
    isRedisConnected = false;
    console.warn(`⚠️ [Redis Init]: Redis unavailable on startup (${err.message}). Using database-only mode.`);
  }
};

export const getRedisStatus = () => isRedisConnected;
