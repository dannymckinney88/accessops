import type { DashboardSummary } from "../types/dashboard";

interface DashboardCriticalByPropertyProps {
  summary: DashboardSummary;
}

const DashboardCriticalByProperty = ({
  summary,
}: DashboardCriticalByPropertyProps) => {
  const { propertyHealthSummaries, criticalCount } = summary;

  if (criticalCount === 0) {
    return (
      <div className="rounded-lg border p-5 flex items-center h-full">
        <p className="text-sm text-muted-foreground">No critical issues</p>
      </div>
    );
  }

  const byProperty = propertyHealthSummaries
    .filter((s) => s.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount);

  const maxCount = Math.max(...byProperty.map((s) => s.criticalCount), 1);

  return (
    <div className="rounded-lg border p-5 flex flex-col gap-4 h-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Critical by Property
      </p>

      <ul className="flex flex-col gap-3" aria-label="Critical issues by property">
        {byProperty.map((s) => {
          const pct = Math.round((s.criticalCount / maxCount) * 100);
          return (
            <li key={s.property.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-foreground">
                  {s.property.name}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-severity-critical">
                  <span aria-hidden="true">{s.criticalCount}</span>
                  <span className="sr-only">
                    {s.criticalCount} critical{" "}
                    {s.criticalCount === 1 ? "issue" : "issues"}
                  </span>
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-severity-critical/50"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardCriticalByProperty;
