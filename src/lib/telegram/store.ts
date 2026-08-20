import "server-only";
import { Redis } from "@upstash/redis";

const LAST_NOTIFIED_URL_KEY = "telegram:last-notified-url";

let client: Redis | null = null;

function getRedis(): Redis {
  if (!client) client = Redis.fromEnv();
  return client;
}

export async function getLastNotifiedUrl(): Promise<string | null> {
  const value = await getRedis().get<string>(LAST_NOTIFIED_URL_KEY);
  return value ?? null;
}

export async function setLastNotifiedUrl(url: string): Promise<void> {
  await getRedis().set(LAST_NOTIFIED_URL_KEY, url);
}
