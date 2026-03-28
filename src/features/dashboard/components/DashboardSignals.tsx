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
    propertiesWithIssues,
    fixedCount,
    verifiedCount,
  } = summary;

  const criticalSublabel =
    criticalCount === 0
      ? "None currently"
      : `Across ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  const fixedSublabel =
    fixedCount === 0 ? "No fixes pending" : "Pending re-audit";

  const verifiedSublabel =
    verifiedCount === 0 ? "None confirmed yet" : "Confirmed by re-audit";

  return (
    <div
      className="grid grid-cols-2 gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]"
      role="group"
      aria-labelledby="signals-heading"
    >
      {/* Primary: Unfixed Issues — hero card spanning 2 cols on mobile, 1 wide col on lg */}
      <div className="col-span-2 lg:col-span-1 rounded-lg border bg-muted/40 p-5 flex flex-col justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Unfixed Issues
        </p>
        <p className="text-5xl font-bold tabular-nums text-foreground leading-none">
          {unfixedCount.toLocaleString()}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{highSeverityCount} critical or serious</span>
          <span aria-hidden="true">·</span>
          <span>
            {propertiesWithIssues}{" "}
            {propertiesWithIssues === 1 ? "property" : "properties"} affected
          </span>
        </div>
      </div>

      {/* Supporting KPIs */}
      <DashboardSignalCard
        label="Critical Unfixed"
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
