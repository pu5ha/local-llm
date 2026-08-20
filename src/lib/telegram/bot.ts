import "server-only";
import { Bot } from "grammy";
import { getNews } from "@/lib/news/getNews";
import { formatNewsItemMessage } from "./format";
import * as store from "./store";

const LATEST_COMMAND_LIMIT = 5;

let bot: Bot | null = null;

/** Lazily constructed so a missing TELEGRAM_BOT_TOKEN doesn't break `next build`. */
export function getBot(): Bot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
    bot = new Bot(token);
    registerHandlers(bot);
  }
  return bot;
}

function registerHandlers(bot: Bot): void {
  bot.command("start", async (ctx) => {
    await store.addSubscriber(ctx.chat.id);
    await ctx.reply(
      "Subscribed! I'll message you here whenever new items land in the local-AI news feed.\n\n" +
        "Send /latest to see the most recent items, or /stop to unsubscribe."
    );
  });

  bot.command("stop", async (ctx) => {
    await store.removeSubscriber(ctx.chat.id);
    await ctx.reply("Unsubscribed — you won't get any more news updates here.");
  });

  bot.command("latest", async (ctx) => {
    const feed = await getNews();
    const latest = feed.items.slice(0, LATEST_COMMAND_LIMIT);
    if (latest.length === 0) {
      await ctx.reply("No news items available right now.");
      return;
    }
    for (const item of latest) {
      await ctx.reply(formatNewsItemMessage(item), { parse_mode: "HTML" });
    }
  });
}
