import type { DashboardSummary } from "../types/dashboard";

interface DashboardCriticalDistributionProps {
  summary: DashboardSummary;
}

const DashboardCriticalDistribution = ({
  summary,
}: DashboardCriticalDistributionProps) => {
  const { propertyHealthSummaries, topCriticalPages, criticalCount } = summary;

  if (criticalCount === 0) {
    return (
      <div className="rounded-lg border p-4 flex items-center h-full">
        <p className="text-sm text-muted-foreground">
          No critical issues unfixed
        </p>
      </div>
    );
  }

  const byProperty = propertyHealthSummaries
    .filter((s) => s.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount);

  const maxPropertyCount = Math.max(
    ...byProperty.map((s) => s.criticalCount),
    1,
  );
  const maxPageCount = Math.max(
    ...topCriticalPages.map((p) => p.criticalCount),
    1,
  );
  const isMultiProperty = byProperty.length > 1;

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4 h-full">
      <p className="text-sm font-medium text-muted-foreground">
        Critical Distribution
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">By property</p>
        <ul
          className="flex flex-col gap-3"
          aria-label="Critical issues by property"
        >
          {byProperty.map((s) => {
            const pct = Math.round((s.criticalCount / maxPropertyCount) * 100);
            return (
              <li key={s.property.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-foreground">
                    {s.property.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
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

      {topCriticalPages.length > 0 && (
        <>
          <div className="h-px bg-border" aria-hidden="true" />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Top pages</p>
            <ul
              className="flex flex-col gap-3"
              aria-label="Critical issues by page"
            >
              {topCriticalPages.map((p) => {
                const pct = Math.round((p.criticalCount / maxPageCount) * 100);
                const label = isMultiProperty
                  ? `${p.pageTitle} · ${p.propertyName}`
                  : p.pageTitle;
                return (
                  <li key={p.pageId} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-foreground truncate">
                        {label}
                      </span>
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
                        className="h-full rounded-full bg-severity-critical/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardCriticalDistribution;
