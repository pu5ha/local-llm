import "server-only";
import { GrammyError } from "grammy";
import { getNews } from "@/lib/news/getNews";
import { canonicalizeUrl } from "@/lib/news/dedupeAndSort";
import type { NewsItem } from "@/lib/news/types";
import { formatNewsItemMessage } from "./format";
import { getBot } from "./bot";
import * as store from "./store";

/** Cap on how many items to send when there's no prior cursor (first run, or the
 *  cursor fell off the feed's 30-day/100-item window) — avoids blasting a new
 *  subscriber's chat history with the entire feed. */
const NO_CURSOR_ITEM_CAP = 5;

/**
 * Pure diff: given the feed (newest-first) and the canonical URL of the last
 * item already sent, returns the items that are new, oldest-first (so
 * subscribers see them in chronological order).
 */
export function selectNewItems(items: NewsItem[], lastNotifiedUrl: string | null): NewsItem[] {
  if (lastNotifiedUrl === null) {
    return items.slice(0, NO_CURSOR_ITEM_CAP).reverse();
  }
  const cursorIndex = items.findIndex((item) => canonicalizeUrl(item.url) === lastNotifiedUrl);
  if (cursorIndex === -1) {
    return items.slice(0, NO_CURSOR_ITEM_CAP).reverse();
  }
  return items.slice(0, cursorIndex).reverse();
}

export interface NotifyResult {
  newItemCount: number;
  subscriberCount: number;
  sentCount: number;
}

/** Fetches the feed, diffs against the stored cursor, and messages every subscriber. */
export async function runNotifyCycle(): Promise<NotifyResult> {
  const feed = await getNews();
  const lastNotifiedUrl = await store.getLastNotifiedUrl();
  const newItems = selectNewItems(feed.items, lastNotifiedUrl);

  if (newItems.length === 0) {
    return { newItemCount: 0, subscriberCount: 0, sentCount: 0 };
  }

  const subscribers = await store.getSubscribers();
  const bot = getBot();

  let sentCount = 0;
  for (const chatId of subscribers) {
    for (const item of newItems) {
      try {
        await bot.api.sendMessage(chatId, formatNewsItemMessage(item), { parse_mode: "HTML" });
        sentCount++;
      } catch (err) {
        if (err instanceof GrammyError && err.error_code === 403) {
          // Subscriber blocked the bot or deleted the chat — stop sending
          // this chat any further items and drop it from the subscriber set.
          await store.removeSubscriber(chatId);
          break;
        }
        console.warn(`[telegram] failed to notify chat ${chatId}:`, err);
      }
    }
  }

  await store.setLastNotifiedUrl(canonicalizeUrl(feed.items[0].url));

  return { newItemCount: newItems.length, subscriberCount: subscribers.length, sentCount };
}
