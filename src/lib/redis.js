import Redis from 'ioredis';

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  redis.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
} else {
  console.warn('REDIS_URL is not set. Redis caching will be disabled.');
}

export default redis;
