import type { DashboardSummary } from "../types/dashboard";

interface DashboardNeedsAttentionProps {
  summary: DashboardSummary;
}

const DashboardNeedsAttention = ({ summary }: DashboardNeedsAttentionProps) => {
  const { propertyHealthSummaries } = summary;

  // Top 2 highest-risk properties: regressing first, then critical count, then unfixed.
  const top2 = [...propertyHealthSummaries]
    .sort((a, b) => {
      const aRegressing = a.trend === "high-risk" ? 1 : 0;
      const bRegressing = b.trend === "high-risk" ? 1 : 0;
      if (bRegressing !== aRegressing) return bRegressing - aRegressing;
      if (b.criticalCount !== a.criticalCount)
        return b.criticalCount - a.criticalCount;
      return b.unfixedCount - a.unfixedCount;
    })
    .slice(0, 2)
    .filter((item) => item.unfixedCount > 0);

  if (top2.length === 0) return null;

  return (
    <section aria-labelledby="needs-attention-heading">
      <div className="rounded-lg border border-l-2 [border-left-color:var(--severity-critical)] bg-surface-raised p-4 flex flex-col gap-3">
        <h2
          id="needs-attention-heading"
          className="text-sm font-semibold tracking-tight"
        >
          Needs Attention
        </h2>

        <ul className="flex flex-col gap-3">
          {top2.map((item, index) => {
            const {
              property,
              unfixedCount,
              criticalCount,
              totalViolations,
              trend,
            } = item;

            const unfixedPct =
              totalViolations > 0
                ? (unfixedCount / totalViolations) * 100
                : 0;

            return (
              <li key={property.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {index + 1}. {property.name}
                  </p>
                  {trend === "high-risk" && (
                    <span className="shrink-0 text-xs font-medium text-trend-regressing">
                      High Risk
                    </span>
                  )}
                </div>

                {/* Mini progress bar — unfixed as proportion of baseline */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${unfixedPct}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{unfixedCount} unfixed</span>
                  {criticalCount > 0 && (
                    <span className="font-semibold text-foreground">
                      {criticalCount} critical
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default DashboardNeedsAttention;
