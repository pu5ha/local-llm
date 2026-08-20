import { runNotifyCycle } from "@/lib/telegram/notify";

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; manual/admin
 *  triggers can instead use the existing `x-admin-key` header. */
function isAuthorized(req: Request): boolean {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (adminKey && req.headers.get("x-admin-key") === adminKey) return true;

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`) return true;

  return false;
}

/** GET, not POST: Vercel Cron always triggers its scheduled path with a GET
 *  request (see vercel.json), automatically adding the CRON_SECRET bearer
 *  header when that env var is set on the project. */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new Response("unauthorized", { status: 401 });
  }
  const result = await runNotifyCycle();
  return Response.json(result);
}
