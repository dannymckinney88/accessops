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
        <p className="text-sm text-muted-foreground">No critical issues unfixed</p>
      </div>
    );
  }

  const byProperty = propertyHealthSummaries
    .filter((s) => s.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount);

  const maxPropertyCount = Math.max(...byProperty.map((s) => s.criticalCount), 1);
  const maxPageCount = Math.max(
    ...topCriticalPages.map((p) => p.criticalCount),
    1,
  );
  const isMultiProperty = byProperty.length > 1;

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-4 h-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Critical Distribution
      </p>

      {/* By property */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-foreground">By property</p>
        <ul
          className="flex flex-col gap-2"
          aria-label="Critical issues by property"
        >
          {byProperty.map((s) => {
            const pct = Math.round(
              (s.criticalCount / maxPropertyCount) * 100,
            );
            return (
              <li
                key={s.property.id}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-32 shrink-0 truncate text-muted-foreground">
                  {s.property.name}
                </span>
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-foreground/30"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 shrink-0 text-right tabular-nums font-medium text-foreground">
                  {s.criticalCount}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {topCriticalPages.length > 0 && (
        <>
          <div className="h-px bg-border" aria-hidden="true" />

          {/* Top pages */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-foreground">Top pages</p>
            <ul
              className="flex flex-col gap-2"
              aria-label="Critical issues by page"
            >
              {topCriticalPages.map((p) => {
                const pct = Math.round(
                  (p.criticalCount / maxPageCount) * 100,
                );
                const label = isMultiProperty
                  ? `${p.pageTitle} · ${p.propertyName}`
                  : p.pageTitle;
                return (
                  <li
                    key={p.pageId}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-32 shrink-0 truncate text-muted-foreground">
                      {label}
                    </span>
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-foreground/30"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-4 shrink-0 text-right tabular-nums font-medium text-foreground">
                      {p.criticalCount}
                    </span>
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
