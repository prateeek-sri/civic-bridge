import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Fast HTTP REST connection for Vercel Serverless
  redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('Using Upstash REST Redis Client');
} else if (process.env.REDIS_URL) {
  // Standard TCP connection for Local Docker Development
  redis = new IORedis(process.env.REDIS_URL);
  
  redis.on('error', (err) => console.error('Redis TCP Error:', err));
  redis.on('connect', () => console.log('Connected to Local TCP Redis successfully'));
} else {
  console.warn('Redis configuration missing. Caching disabled.');
}

export default redis;
