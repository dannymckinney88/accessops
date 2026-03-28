import { getDashboardSummary } from "@/lib/data/index";
import DashboardClient from "@/features/dashboard/components/DashboardClient";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="page-shell">
      <DashboardClient summary={summary} />
    </div>
  );
}
