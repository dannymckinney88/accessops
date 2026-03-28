import type { DashboardSummary } from "../types/dashboard";

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
      <p className="text-sm font-medium text-muted-foreground">
        Critical by Page
      </p>

      <ul className="flex flex-col gap-3" aria-label="Critical issues by page">
        {topCriticalPages.map((p) => {
          const pct = Math.round((p.criticalCount / maxCount) * 100);
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
                  {p.criticalCount}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-foreground/30"
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

export default DashboardTopPages;
