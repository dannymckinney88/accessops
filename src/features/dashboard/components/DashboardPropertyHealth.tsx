import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardPropertyHealthProps {
  summary: DashboardSummary;
}

const DashboardPropertyHealth = ({ summary }: DashboardPropertyHealthProps) => {
  const sorted = [...summary.propertyHealthSummaries].sort((a, b) => {
    if (b.unfixedCount !== a.unfixedCount) return b.unfixedCount - a.unfixedCount;
    return b.criticalCount - a.criticalCount;
  });

  return (
    <ul
      className="flex flex-col divide-y rounded-lg border"
      role="list"
      aria-describedby="property-health-description"
    >
      {sorted.map((item, index) => {
        const { property, unfixedCount, criticalCount, totalViolations, trend } =
          item;

        const unfixedPct =
          totalViolations > 0 ? (unfixedCount / totalViolations) * 100 : 0;

        const TrendIcon =
          trend === "regressing"
            ? TrendingDown
            : trend === "improving"
              ? TrendingUp
              : Minus;

        const trendLabel =
          trend === "regressing"
            ? "Regressing"
            : trend === "improving"
              ? "Improving"
              : trend === "stable"
                ? "Stable"
                : "No data";

        const trendStyle =
          trend === "regressing"
            ? { color: "var(--destructive)" }
            : trend === "improving"
              ? { color: "var(--status-verified)" }
              : { color: "var(--muted-foreground)" };

        return (
          <li key={property.id} className="flex items-center gap-4 px-4 py-3.5">
            {/* Rank */}
            <span
              className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>

            {/* Name + progress bar */}
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {property.name}
              </p>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-foreground/25"
                  style={{ width: `${unfixedPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {unfixedCount} of {totalViolations} unfixed
              </p>
            </div>

            {/* Stats */}
            <dl className="flex shrink-0 items-center gap-5 text-sm">
              <div className="flex flex-col items-end">
                <dt className="sr-only">Critical issues</dt>
                <dd
                  className={
                    criticalCount > 0
                      ? "tabular-nums font-medium text-severity-critical"
                      : "tabular-nums font-medium text-muted-foreground"
                  }
                >
                  {criticalCount}
                </dd>
                <dd className="text-xs text-muted-foreground">critical</dd>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <TrendIcon
                  className="h-4 w-4"
                  style={trendStyle}
                  aria-label={`Trend: ${trendLabel}`}
                />
                <span className="text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
};

export default DashboardPropertyHealth;
