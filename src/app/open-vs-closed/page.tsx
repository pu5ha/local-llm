import { getGapData } from "@/lib/gap/getGapData";
import OpenVsClosedView from "./OpenVsClosedView";

export default async function OpenVsClosedPage() {
  const data = await getGapData();
  return <OpenVsClosedView data={data} />;
}
