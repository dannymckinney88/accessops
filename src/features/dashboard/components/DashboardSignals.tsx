import type { DashboardSummary } from "../types/dashboard";
import DashboardSignalCard from "./DashboardSignalCard";

interface DashboardSignalsProps {
  summary: DashboardSummary;
}

const DashboardSignals = ({ summary }: DashboardSignalsProps) => {
  const {
    totalViolations,
    criticalCount,
    propertyCount,
    propertiesWithIssues,
    propertiesWithCritical,
  } = summary;

  const unresolvedCount = summary.propertyHealthSummaries.reduce(
    (sum, s) => sum + s.unresolvedCount,
    0,
  );

  const criticalSublabel =
    criticalCount === 0
      ? "None currently"
      : `In ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      role="group"
      aria-labelledby="summary-signals-heading"
    >
      <DashboardSignalCard
        label="Total issues"
        value={totalViolations}
        sublabel={`${unresolvedCount} unresolved`}
      />
      <DashboardSignalCard
        label="Critical issues"
        value={criticalCount}
        sublabel={criticalSublabel}
        critical={criticalCount > 0}
      />
      <DashboardSignalCard
        label="Properties with issues"
        value={propertiesWithIssues}
        sublabel={`${propertiesWithCritical} with critical issues`}
      />
    </div>
  );
};

export default DashboardSignals;
