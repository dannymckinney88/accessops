import { AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardPropertyHealthProps {
  summary: DashboardSummary;
}

const DashboardPropertyHealth = ({ summary }: DashboardPropertyHealthProps) => {
  const sorted = [...summary.propertyHealthSummaries].sort((a, b) => {
    if (a.trend === "high-risk" && b.trend !== "high-risk") return -1;
    if (b.trend === "high-risk" && a.trend !== "high-risk") return 1;
    return b.criticalCount - a.criticalCount;
  });

  return (
    <ul className="flex flex-col gap-10" role="list">
      {sorted.map((item, idx) => {
        const {
          property,
          trend,
          criticalCount,
          unfixedCount,
          totalViolations,
        } = item;
        const resolvedPct =
          totalViolations > 0
            ? Math.round(
                ((totalViolations - unfixedCount) / totalViolations) * 100,
              )
            : 0;

        const isHighRisk = trend === "high-risk";
        const isImproving =
          trend === "active-remediation" || trend === "healthy";

        return (
          <li key={property.id} className="relative">
            {/* Visual separator for row units */}
            {idx !== 0 && (
              <div className="absolute -top-5 left-0 right-0 border-t border-border/30" />
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight truncate">
                  {property.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={`size-3 ${isHighRisk ? "text-severity-critical" : "text-muted-foreground/30"}`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tight ${
                      isHighRisk
                        ? "text-severity-critical"
                        : isImproving
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-muted-foreground"
                    }`}
                  >
                    {trend === "high-risk"
                      ? "High Risk"
                      : trend === "healthy"
                        ? "Healthy"
                        : trend === "active-remediation"
                          ? "Active Remediation"
                          : "Stagnant"}
                  </span>
                </div>
              </div>

              {/* Right-aligned Data Stack */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-bold text-severity-critical tabular-nums">
                  {criticalCount} critical
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                  {unfixedCount} unfixed
                </span>
              </div>
            </div>

            {/* Health bar — fill represents resolved work; more fill = healthier */}
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40"
              aria-label={`${resolvedPct}% of issues resolved`}
            >
              <div
                className={`h-full transition-all duration-500 ${
                  isHighRisk
                    ? "bg-severity-critical/60"
                    : isImproving
                      ? "bg-emerald-500/70"
                      : "bg-muted-foreground/40"
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
