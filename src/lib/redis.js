import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Fast HTTP REST connection for Vercel Serverless
  const upstash = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  // Wrap Upstash to perfectly match the ioredis API so our app doesn't crash!
  redis = {
    get: async (key) => {
      const val = await upstash.get(key);
      // Upstash automatically parses JSON, but our app expects a string. Let's convert it back.
      return val ? (typeof val === 'string' ? val : JSON.stringify(val)) : null;
    },
    set: async (key, val, exString, exValue) => {
      // Upstash uses { ex: 60 } instead of 'EX', 60
      if (exString === 'EX') {
        return upstash.set(key, val, { ex: exValue });
      }
      return upstash.set(key, val);
    },
    keys: (pattern) => upstash.keys(pattern),
    del: (...keys) => upstash.del(...keys),
    on: () => {}, // Mock event listener so the app doesn't complain
  };

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
