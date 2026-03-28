import type { DashboardSummary } from "../types/dashboard";

interface DashboardPropertyHealthProps {
  summary: DashboardSummary;
}

const DashboardPropertyHealth = ({ summary }: DashboardPropertyHealthProps) => {
  const top3 = [...summary.propertyHealthSummaries]
    .sort((a, b) => {
      // Sort worst-first: critical desc, then total violations desc
      if (b.criticalCount !== a.criticalCount) {
        return b.criticalCount - a.criticalCount;
      }
      return b.totalViolations - a.totalViolations;
    })
    .slice(0, 3);

  return (
    <ul
      className="flex flex-col divide-y rounded-lg border"
      role="list"
      aria-describedby="property-health-description"
    >
      {top3.map((item) => {
        const { property, totalViolations, criticalCount } = item;
        return (
          <li
            key={property.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground truncate">
              {property.name}
            </p>
            <dl className="flex items-center gap-4 shrink-0 text-sm">
              <div className="flex flex-col items-end">
                <dt className="sr-only">Total issues</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {totalViolations}
                </dd>
                <dd className="text-xs text-muted-foreground">total</dd>
              </div>

              <div className="flex flex-col items-end">
                <dt className="sr-only">Critical issues</dt>
                <dd
                  className={
                    criticalCount > 0
                      ? "font-medium tabular-nums text-severity-critical"
                      : "font-medium tabular-nums text-muted-foreground"
                  }
                >
                  {criticalCount}
                </dd>
                <dd className="text-xs text-muted-foreground">critical</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
};

export default DashboardPropertyHealth;
