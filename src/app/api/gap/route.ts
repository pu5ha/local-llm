import { revalidateTag } from "next/cache";
import { getGapData } from "@/lib/gap/getGapData";
import { GAP_TAG } from "@/lib/gap/fetchAaModels";

export async function GET() {
  return Response.json(await getGapData());
}

/** Manual "refresh now" escape hatch — e.g. a button on /admin/gap. */
export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return new Response("unauthorized", { status: 401 });
  }
  revalidateTag(GAP_TAG, { expire: 60 * 60 * 12 });
  return Response.json({ revalidated: true });
}
