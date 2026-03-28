import type { DashboardSummary } from "../types/dashboard";

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
    acceptedRiskCount,
  } = summary;

  return (
    <div
      className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr] divide-x bg-muted/30"
      role="list"
      aria-label="Accessibility health metrics"
    >
      {/* Unfixed — primary risk signal, most prominent */}
      <div role="listitem" className="flex flex-col gap-1.5 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Unfixed Issues
        </p>
        <p className="text-4xl font-bold tabular-nums leading-none text-foreground">
          {unfixedCount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {highSeverityCount} critical or serious &middot;{" "}
          {propertiesWithIssues}{" "}
          {propertiesWithIssues === 1 ? "property" : "properties"} affected
        </p>
      </div>

      {/* Critical — urgency signal, severity color */}
      <div
        role="listitem"
        className="flex flex-col gap-1.5 px-4 py-4 border-l border-destructive/40"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Critical Unfixed
        </p>
        <p
          className={`text-3xl font-semibold tabular-nums leading-none ${
            criticalCount > 0 ? "text-severity-critical" : "text-foreground"
          }`}
        >
          {criticalCount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {criticalCount === 0
            ? "None currently"
            : `Across ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`}
        </p>
      </div>

      {/* Fixed — progress signal */}
      <div role="listitem" className="flex flex-col gap-1.5 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Fixed
        </p>
        <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">
          {fixedCount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {fixedCount === 0 ? "No fixes pending" : "Pending re-audit"}
        </p>
      </div>

      {/* Verified — completion signal */}
      <div role="listitem" className="flex flex-col gap-1.5 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Verified
        </p>
        <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">
          {verifiedCount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {verifiedCount === 0 ? "None confirmed" : "Confirmed by re-audit"}
        </p>
      </div>

      {/* Accepted Risk — scoping signal */}
      <div role="listitem" className="flex flex-col gap-1.5 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Accepted Risk
        </p>
        <p className="text-2xl font-semibold tabular-nums leading-none text-foreground">
          {acceptedRiskCount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {acceptedRiskCount === 0 ? "None deferred" : "Intentionally deferred"}
        </p>
      </div>
    </div>
  );
};

export default DashboardSignals;
