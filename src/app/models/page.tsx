import { getCatalog } from "@/lib/catalog/getCatalog";
import ModelsBrowser from "./ModelsBrowser";

export default async function ModelsPage() {
  const catalog = await getCatalog();
  return <ModelsBrowser models={catalog.models} />;
}
