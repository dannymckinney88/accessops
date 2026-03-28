import type { DashboardSummary } from "../types/dashboard";
import DashboardSignalCard from "./DashboardSignalCard";

interface DashboardSignalsProps {
  summary: DashboardSummary;
}

const DashboardSignals = ({ summary }: DashboardSignalsProps) => {
  const {
    unfixedCount,
    criticalCount,
    highSeverityCount,
    propertyCount,
    propertiesWithCritical,
    fixedCount,
    verifiedCount,
  } = summary;

  // Card 1: primary work-remaining signal — open + in-progress violations.
  const issueSublabel = `${highSeverityCount} critical or serious`;

  // Card 2: critical unfixed — "across N properties" tells you whether critical
  // issues are isolated to one team or spread across the portfolio.
  const criticalSublabel =
    criticalCount === 0
      ? "None currently"
      : `Across ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  // Card 3: fixed — work completed internally, not yet confirmed by a re-audit.
  const fixedSublabel =
    fixedCount === 0 ? "No fixes pending verification" : "Pending re-audit";

  // Card 4: verified — confirmed resolved by a later audit.
  const verifiedSublabel =
    verifiedCount === 0 ? "None confirmed yet" : "Confirmed by re-audit";

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="group"
      aria-labelledby="summary-signals-heading"
    >
      <DashboardSignalCard
        label="Unfixed issues"
        value={unfixedCount}
        sublabel={issueSublabel}
      />
      <DashboardSignalCard
        label="Critical unfixed"
        value={criticalCount}
        sublabel={criticalSublabel}
        critical={criticalCount > 0}
      />
      <DashboardSignalCard
        label="Fixed"
        value={fixedCount}
        sublabel={fixedSublabel}
      />
      <DashboardSignalCard
        label="Verified"
        value={verifiedCount}
        sublabel={verifiedSublabel}
      />
    </div>
  );
};

export default DashboardSignals;
