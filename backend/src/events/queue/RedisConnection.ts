import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';

let redis: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(url, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 5000);
        logger.warn(`Redis reconnecting (attempt ${times})...`);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err: Error) => logger.error('Redis error', err));
    redis.on('close', () => logger.warn('Redis connection closed'));
  }
  return redis;
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed');
  }
}
