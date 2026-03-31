import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardPropertyHealthProps {
  summary: DashboardSummary;
}

const DashboardPropertyHealth = ({ summary }: DashboardPropertyHealthProps) => {
  // Top 3 by risk: regressing first, then by critical count descending
  const sorted = [...summary.propertyHealthSummaries]
    .sort((a, b) => {
      if (a.trend === "regressing" && b.trend !== "regressing") return -1;
      if (b.trend === "regressing" && a.trend !== "regressing") return 1;
      if (b.criticalCount !== a.criticalCount)
        return b.criticalCount - a.criticalCount;
      return b.unfixedCount - a.unfixedCount;
    })
    .slice(0, 3);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No properties with active issues.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3" role="list" aria-label="Top 3 properties by risk">
      {sorted.map((item) => {
        const { property, trend, criticalCount, unfixedCount, totalViolations } =
          item;

        const resolvedPct =
          totalViolations > 0
            ? Math.round(
                ((totalViolations - unfixedCount) / totalViolations) * 100,
              )
            : 0;

        const trendConfig = {
          regressing: {
            label: "Regressing",
            className: "text-trend-regressing",
            Icon: TrendingDown,
          },
          improving: {
            label: "Improving",
            className: "text-trend-improving",
            Icon: TrendingUp,
          },
          stable: {
            label: "Stagnant",
            className: "text-muted-foreground",
            Icon: Minus,
          },
          "insufficient-data": {
            label: "Stagnant",
            className: "text-muted-foreground",
            Icon: Minus,
          },
        }[trend];

        const isHighRisk =
          trend !== "regressing" && criticalCount > 0 && unfixedCount > 0;

        return (
          <li key={property.id} role="listitem">
            {/* Property name row */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {property.name}
              </p>
              <span
                className="shrink-0 tabular-nums text-xs font-semibold text-severity-critical"
                aria-label={`${criticalCount} critical`}
              >
                {criticalCount > 0
                  ? `${criticalCount} critical`
                  : null}
              </span>
            </div>

            {/* Trend label + progress */}
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {isHighRisk ? (
                  <AlertTriangle
                    className="size-3 shrink-0 text-severity-critical"
                    aria-hidden="true"
                  />
                ) : (
                  <trendConfig.Icon
                    className={`size-3 shrink-0 ${trendConfig.className}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    isHighRisk ? "text-severity-critical" : trendConfig.className
                  }`}
                >
                  {isHighRisk ? "High Risk" : trendConfig.label}
                </span>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {resolvedPct}%
              </span>
            </div>

            {/* Mini progress bar */}
            <div
              className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div
                className={`h-full rounded-full ${
                  trend === "regressing"
                    ? "bg-severity-critical"
                    : resolvedPct === 100
                      ? "bg-status-verified"
                      : "bg-primary"
                }`}
                style={{ width: `${resolvedPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default DashboardPropertyHealth;
