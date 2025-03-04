// src/config/environment.ts  

export const environment = {
  port: process.env.PORT || 7001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/image-processor',
  storageUrl: process.env.STORAGE_URL || 'https://storage.example.com',
  compressionQuality: 50, // 50% of original quality
  workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
};
