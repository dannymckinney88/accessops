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
    propertiesWithIssues,
    propertiesWithCritical,
    regressingCount,
  } = summary;

  // Card 1: primary work-remaining signal — how many issues still need action.
  // Sublabel surfaces urgency concentration within the unfixed set.
  const issueSublabel = `${highSeverityCount} critical or serious`;

  // Card 2: critical issue concentration — "across N properties" tells you
  // whether critical issues are isolated or spread
  const criticalSublabel =
    criticalCount === 0
      ? "None currently"
      : `Across ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  // Card 3: momentum signal — tells whether the system is actively getting worse.
  // "Regressing" means the latest scan has more violations than the one before.
  // A value > 0 means action is needed now, not eventually.
  const regressingSublabel =
    regressingCount === 0
      ? "No active regressions"
      : `${regressingCount} of ${propertiesWithIssues} affected ${propertiesWithIssues === 1 ? "property" : "properties"}`;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      role="group"
      aria-labelledby="summary-signals-heading"
    >
      <DashboardSignalCard
        label="Unfixed issues"
        value={unfixedCount}
        sublabel={issueSublabel}
      />
      <DashboardSignalCard
        label="Critical issues"
        value={criticalCount}
        sublabel={criticalSublabel}
        critical={criticalCount > 0}
      />
      <DashboardSignalCard
        label="Properties regressing"
        value={regressingCount}
        sublabel={regressingSublabel}
      />
    </div>
  );
};

export default DashboardSignals;
