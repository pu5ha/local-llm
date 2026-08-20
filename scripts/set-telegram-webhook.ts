/**
 * Registers this bot's webhook URL with Telegram. Run once after deploying
 * (and again any time the deployment URL or TELEGRAM_WEBHOOK_SECRET changes).
 *
 * Usage:
 *   SITE_URL=https://your-deployment.vercel.app npm run telegram:set-webhook
 */
import { Bot } from "grammy";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "SITE_URL is not set, e.g. SITE_URL=https://example.com npm run telegram:set-webhook"
    );
  }

  const webhookUrl = `${siteUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  const bot = new Bot(token);
  await bot.api.setWebhook(webhookUrl, secretToken ? { secret_token: secretToken } : undefined);

  console.log(`Webhook set to ${webhookUrl}${secretToken ? " (with secret token)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
