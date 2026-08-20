import "server-only";
import { getNews } from "@/lib/news/getNews";
import { canonicalizeUrl } from "@/lib/news/dedupeAndSort";
import type { NewsItem } from "@/lib/news/types";
import { formatNewsItemMessage } from "./format";
import { getBot } from "./bot";
import * as store from "./store";

/** Cap on how many items to send when there's no prior cursor (first run, or the
 *  cursor fell off the feed's 30-day/100-item window) — avoids blasting the
 *  channel with the entire feed. */
const NO_CURSOR_ITEM_CAP = 5;

/**
 * Pure diff: given the feed (newest-first) and the canonical URL of the last
 * item already sent, returns the items that are new, oldest-first (so the
 * channel sees them in chronological order).
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
  sentCount: number;
}

/** Fetches the feed, diffs against the stored cursor, and posts new items to the channel. */
export async function runNotifyCycle(): Promise<NotifyResult> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) throw new Error("TELEGRAM_CHANNEL_ID is not set");

  const feed = await getNews();
  const lastNotifiedUrl = await store.getLastNotifiedUrl();
  const newItems = selectNewItems(feed.items, lastNotifiedUrl);

  if (newItems.length === 0) {
    return { newItemCount: 0, sentCount: 0 };
  }

  const bot = getBot();
  let sentCount = 0;
  for (const item of newItems) {
    try {
      await bot.api.sendMessage(channelId, formatNewsItemMessage(item), { parse_mode: "HTML" });
      sentCount++;
    } catch (err) {
      console.warn("[telegram] failed to post item to channel:", err);
    }
  }

  // Only advance the cursor if at least one post succeeded — if the channel
  // id is wrong or the bot isn't an admin there, every send fails, and
  // advancing anyway would silently lose this whole batch forever.
  if (sentCount > 0) {
    await store.setLastNotifiedUrl(canonicalizeUrl(feed.items[0].url));
  }

  return { newItemCount: newItems.length, sentCount };
}
