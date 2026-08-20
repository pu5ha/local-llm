import { revalidateTag } from "next/cache";
import { getNews } from "@/lib/news/getNews";
import { NEWS_TAG, NEWS_REVALIDATE_SECONDS } from "@/lib/news/constants";

export async function GET() {
  return Response.json(await getNews());
}

/** Manual "refresh now" escape hatch — ops convenience only, no review UI. */
export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return new Response("unauthorized", { status: 401 });
  }
  revalidateTag(NEWS_TAG, { expire: NEWS_REVALIDATE_SECONDS });
  return Response.json({ revalidated: true });
}
