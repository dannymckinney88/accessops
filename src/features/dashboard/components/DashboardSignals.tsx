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
    propertiesWithCritical,
  } = summary;

  const unresolvedCount = summary.propertyHealthSummaries.reduce(
    (sum, s) => sum + s.unresolvedCount,
    0,
  );

  const criticalSublabel =
    propertiesWithCritical === 0
      ? "Across all properties"
      : `Across ${propertiesWithCritical} ${propertiesWithCritical === 1 ? "property" : "properties"}`;

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
        label="Properties affected"
        value={propertyCount}
        sublabel={`${propertiesWithCritical} with critical issues`}
      />
    </div>
  );
};

export default DashboardSignals;
