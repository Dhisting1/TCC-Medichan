import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl ? createClient({ url: redisUrl }) : null;

if (redis) {
  redis.on("error", (err) => {
    console.warn("Redis connection error (non-fatal):", err.message);
  });

  redis.connect().catch((err) => {
    console.warn("Redis connect failed (non-fatal):", err.message);
  });
}
