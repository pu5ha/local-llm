import "server-only";
import { Redis } from "@upstash/redis";

const SUBSCRIBERS_KEY = "telegram:subscribers";
const LAST_NOTIFIED_URL_KEY = "telegram:last-notified-url";

let client: Redis | null = null;

function getRedis(): Redis {
  if (!client) client = Redis.fromEnv();
  return client;
}

export async function addSubscriber(chatId: number): Promise<void> {
  await getRedis().sadd(SUBSCRIBERS_KEY, chatId);
}

export async function removeSubscriber(chatId: number): Promise<void> {
  await getRedis().srem(SUBSCRIBERS_KEY, chatId);
}

export async function getSubscribers(): Promise<number[]> {
  const members = await getRedis().smembers(SUBSCRIBERS_KEY);
  return members.map(Number);
}

export async function getLastNotifiedUrl(): Promise<string | null> {
  const value = await getRedis().get<string>(LAST_NOTIFIED_URL_KEY);
  return value ?? null;
}

export async function setLastNotifiedUrl(url: string): Promise<void> {
  await getRedis().set(LAST_NOTIFIED_URL_KEY, url);
}
