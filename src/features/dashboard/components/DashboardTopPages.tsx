import type { DashboardSummary } from "../types/dashboard";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface DashboardTopPagesProps {
  summary: DashboardSummary;
}

const DashboardTopPages = ({ summary }: DashboardTopPagesProps) => {
  const { topCriticalPages, propertyHealthSummaries, criticalCount } = summary;

  if (criticalCount === 0 || topCriticalPages.length === 0) {
    return (
      <div className="rounded-lg border p-5 flex items-center h-full">
        <p className="text-sm text-muted-foreground">No critical issues</p>
      </div>
    );
  }

  const isMultiProperty =
    propertyHealthSummaries.filter((s) => s.criticalCount > 0).length > 1;
  const maxCount = Math.max(...topCriticalPages.map((p) => p.criticalCount), 1);

  return (
    <div className="rounded-lg border p-5 flex flex-col gap-4 h-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Critical by Page
      </p>

      <ul className="flex flex-col gap-3" aria-label="Critical issues by page">
        {topCriticalPages.map((p, index) => {
          const pct = Math.round((p.criticalCount / maxCount) * 100);
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <li key={p.pageId} className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {p.pageTitle}
                  </p>
                  {isMultiProperty && (
                    <p className="text-xs text-muted-foreground truncate">
                      {p.propertyName}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  <span aria-hidden="true">{p.criticalCount}</span>
                  <span className="sr-only">
                    {p.criticalCount} critical{" "}
                    {p.criticalCount === 1 ? "issue" : "issues"}
                  </span>
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardTopPages;
