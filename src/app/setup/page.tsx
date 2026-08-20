import { getCatalog } from "@/lib/catalog/getCatalog";
import SetupWizard from "./SetupWizard";

export default async function SetupPage() {
  const catalog = await getCatalog();
  return <SetupWizard models={catalog.models} />;
}
