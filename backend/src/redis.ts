import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl);

// Separate connections for pub/sub, since a subscriber connection can't issue other commands.
export const redisPub = new Redis(env.redisUrl);
export const redisSub = new Redis(env.redisUrl);

const CACHE_PREFIX = "cache:";

export async function cacheGetOrSet<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const cached = await redis.get(CACHE_PREFIX + key);
  if (cached) return JSON.parse(cached) as T;
  const value = await load();
  await redis.set(CACHE_PREFIX + key, JSON.stringify(value), "EX", ttlSeconds);
  return value;
}

export async function cacheInvalidate(key: string): Promise<void> {
  await redis.del(CACHE_PREFIX + key);
}

export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  const pattern = CACHE_PREFIX + prefix + "*";
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = next;
    if (keys.length) await redis.del(...keys);
  } while (cursor !== "0");
}
