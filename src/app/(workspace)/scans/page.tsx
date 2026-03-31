import { getScansScreenData } from "@/lib/data/index";
import ScansClient from "@/features/scans/components/ScansClient";

export default async function ScansPage() {
  const data = await getScansScreenData();

  return (
    <div className="page-shell">
      <ScansClient data={data} />
    </div>
  );
}
