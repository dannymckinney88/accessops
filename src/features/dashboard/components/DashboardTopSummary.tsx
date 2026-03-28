import type { DashboardSummary } from "../types/dashboard";

interface DashboardTopSummaryProps {
  summary: DashboardSummary;
}

const DashboardTopSummary = ({ summary }: DashboardTopSummaryProps) => {
  const {
    totalViolations,
    propertyCount,
    unfixedCount,
    fixedCount,
    verifiedCount,
    acceptedRiskCount,
    topCriticalRule,
    propertyHealthSummaries,
  } = summary;

  const sorted = [...propertyHealthSummaries].sort((a, b) => {
    if (b.unfixedCount !== a.unfixedCount) return b.unfixedCount - a.unfixedCount;
    return b.criticalCount - a.criticalCount;
  });

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4 h-full">
      {/* Audit baseline context */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Portfolio Snapshot
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {totalViolations} violations · {propertyCount} properties
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {unfixedCount} unfixed
          {fixedCount > 0 && ` · ${fixedCount} pending verification`}
          {verifiedCount > 0 && ` · ${verifiedCount} verified`}
          {acceptedRiskCount > 0 && ` · ${acceptedRiskCount} accepted risk`}
        </p>
      </div>

      <div className="h-px bg-border" aria-hidden="true" />

      {/* Most common critical rule — actionable pattern signal */}
      {topCriticalRule && (
        <>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Most Common Critical
            </p>
            <p className="mt-1 text-sm text-foreground">
              {topCriticalRule.help}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {topCriticalRule.count}{" "}
              {topCriticalRule.count === 1 ? "instance" : "instances"} across{" "}
              {topCriticalRule.propertyCount}{" "}
              {topCriticalRule.propertyCount === 1 ? "property" : "properties"}
            </p>
          </div>
          <div className="h-px bg-border" aria-hidden="true" />
        </>
      )}

      {/* Compact per-property breakdown */}
      <ul
        className="flex flex-col divide-y"
        aria-label="Per-property issue breakdown"
      >
        {sorted.map(({ property, unfixedCount: pUnfixed, criticalCount: pCritical, trend }) => {
          const trendText =
            trend === "regressing"
              ? "Regressing"
              : trend === "improving"
                ? "Improving"
                : null;

          return (
            <li
              key={property.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <p className="truncate text-sm text-foreground">{property.name}</p>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <span className="tabular-nums text-muted-foreground">
                  {pUnfixed} unfixed
                </span>
                {pCritical > 0 && (
                  <span className="tabular-nums font-semibold text-foreground">
                    {pCritical} crit
                  </span>
                )}
                {trendText && (
                  <span
                    className={
                      trend === "regressing"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {trendText}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardTopSummary;
