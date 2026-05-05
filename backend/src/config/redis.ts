import { createClient } from "redis";

export const redis = createClient({
  url: "redis://default:senha@redis.railway.internal:6379",
});

redis.connect();
