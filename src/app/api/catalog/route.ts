import { revalidateTag } from "next/cache";
import { getCatalog } from "@/lib/catalog/getCatalog";
import { CATALOG_TAG } from "@/lib/catalog/fetchLiveFacts";

export async function GET() {
  return Response.json(await getCatalog());
}

/** Manual "refresh now" escape hatch — e.g. a button on /admin/catalog. */
export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return new Response("unauthorized", { status: 401 });
  }
  revalidateTag(CATALOG_TAG, { expire: 60 * 60 * 6 });
  return Response.json({ revalidated: true });
}
