import { createClient } from "redis";
import { ENV } from "./env.js";

export const redis = createClient({
  url: `redis://localhost:${ENV.REDIS_PORT}`,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

await redis.connect();
