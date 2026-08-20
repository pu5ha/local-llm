import "server-only";
import { Bot } from "grammy";
import { getNews } from "@/lib/news/getNews";
import { formatNewsItemMessage } from "./format";

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

function channelJoinUrl(): string | null {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId?.startsWith("@")) return null;
  return `https://t.me/${channelId.slice(1)}`;
}

function registerHandlers(bot: Bot): void {
  bot.command("start", async (ctx) => {
    const joinUrl = channelJoinUrl();
    const joinLine = joinUrl
      ? `Join ${joinUrl} to get new local-AI news posted there automatically.`
      : "Join our news channel to get updates automatically.";
    await ctx.reply(`${joinLine}\n\nYou can also send /latest here anytime to see recent items.`);
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
