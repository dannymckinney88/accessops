import { AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardCriticalAlertProps {
  summary: DashboardSummary;
}

const DashboardCriticalAlert = ({ summary }: DashboardCriticalAlertProps) => {
  const { criticalCount, propertiesWithCritical, propertyHealthSummaries } =
    summary;

  if (criticalCount === 0) return null;

  const affectedProperties = propertyHealthSummaries
    .filter((s) => s.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount);

  return (
    <section aria-labelledby="critical-alert-heading">
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div>
            <h2
              id="critical-alert-heading"
              className="text-sm font-semibold text-destructive"
            >
              {criticalCount} critical{" "}
              {criticalCount === 1 ? "issue" : "issues"} unfixed
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {propertiesWithCritical === 1
                ? "Affecting 1 property"
                : `Spread across ${propertiesWithCritical} properties`}{" "}
              — highest remediation priority
            </p>
          </div>
        </div>

        <ul
          className="flex flex-col gap-3"
          aria-label="Properties with critical issues"
        >
          {affectedProperties.map(
            ({ property, criticalCount: count, unfixedCount, trend }) => (
              <li key={property.id} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">
                    {property.name}
                  </span>
                  <span className="ml-3 shrink-0 tabular-nums font-medium text-destructive">
                    {count}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {unfixedCount} unfixed total
                  {trend === "regressing" && (
                    <span className="text-destructive"> · Regressing</span>
                  )}
                </p>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
};

export default DashboardCriticalAlert;
