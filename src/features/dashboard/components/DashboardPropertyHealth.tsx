import { AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardPropertyHealthProps {
  summary: DashboardSummary;
}

const DashboardPropertyHealth = ({ summary }: DashboardPropertyHealthProps) => {
  const sorted = [...summary.propertyHealthSummaries].sort((a, b) => {
    if (a.trend === "regressing" && b.trend !== "regressing") return -1;
    if (b.trend === "regressing" && a.trend !== "regressing") return 1;
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

        const isHighRisk =
          trend !== "regressing" && trend !== "improving" && criticalCount > 0;
        const isImproving = trend === "improving";

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
                    className={`size-3 ${trend === "regressing" || isHighRisk ? "text-severity-critical" : "text-muted-foreground/30"}`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tight ${trend === "regressing" || isHighRisk ? "text-severity-critical" : isImproving ? "text-primary/70" : "text-muted-foreground/60"}`}
                  >
                    {trend === "regressing"
                      ? "Regressing"
                      : isHighRisk
                        ? "High Risk"
                        : isImproving
                          ? "Improving"
                          : "Stable"}
                  </span>
                </div>
              </div>

              {/* Right-aligned Data Stack */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-bold text-severity-critical tabular-nums">
                  {criticalCount} critical
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                  {resolvedPct}% resolved
                </span>
              </div>
            </div>

            {/* Tightened Progress Bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={`h-full transition-all duration-500 ${trend === "regressing" ? "bg-severity-critical" : "bg-primary/80"}`}
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
