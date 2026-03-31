import { AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardHighestRiskProps {
  summary: DashboardSummary;
}

const DashboardHighestRisk = ({ summary }: DashboardHighestRiskProps) => {
  // Properties with critical unfixed violations, sorted by critical count descending.
  const withCritical = summary.propertyHealthSummaries
    .filter((s) => s.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount)
    .slice(0, 3);

  if (withCritical.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No critical unfixed issues.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" role="list" aria-label="Properties with highest critical issue counts">
      {withCritical.map(({ property, criticalCount }) => (
        <li
          key={property.id}
          role="listitem"
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle
              className="size-3.5 shrink-0 text-severity-critical"
              aria-hidden="true"
            />
            <span className="truncate text-sm text-foreground">
              {property.name}
            </span>
          </div>
          <span
            className="shrink-0 tabular-nums text-xs font-semibold text-severity-critical"
            aria-label={`${criticalCount} critical ${criticalCount === 1 ? "issue" : "issues"}`}
          >
            {criticalCount} critical
          </span>
        </li>
      ))}
    </ul>
  );
};

export default DashboardHighestRisk;
