import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        console.warn(`Redis connection failed (attempt ${times}). Falling back to dummy mode.`);
        return null; // stop retrying
      }
      return Math.min(times * 100, 1000);
    }
  });

  redis.connect().catch((err) => {
    console.warn("Could not connect to Redis server on start:", err.message);
  });

  redis.on("error", (err) => {
    // Suppress spamming but log warnings
    console.warn("Redis client warning:", err.message);
  });
} catch (e: any) {
  console.warn("Failed to initialize Redis pool client:", e.message);
}

export { redis };
