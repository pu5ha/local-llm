import { getNews } from "@/lib/news/getNews";
import NewsBrowser from "./NewsBrowser";

export default async function NewsPage() {
  const feed = await getNews();
  return <NewsBrowser items={feed.items} meta={feed.meta} />;
}
