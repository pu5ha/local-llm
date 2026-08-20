import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram/bot";

let handler: ((req: Request) => Promise<Response>) | null = null;

function getHandler(): (req: Request) => Promise<Response> {
  if (!handler) {
    handler = webhookCallback(getBot(), "std/http", {
      secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
    });
  }
  return handler;
}

/** Receives Telegram updates. grammy verifies the X-Telegram-Bot-Api-Secret-Token
 *  header against TELEGRAM_WEBHOOK_SECRET before dispatching to command handlers. */
export async function POST(req: Request) {
  try {
    return await getHandler()(req);
  } catch (err) {
    console.error("[telegram webhook]", err);
    return new Response("error", { status: 500 });
  }
}
