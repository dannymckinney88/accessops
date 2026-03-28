import type { DashboardSummary } from "../types/dashboard";

interface DashboardNeedsAttentionProps {
  summary: DashboardSummary;
}

const DashboardNeedsAttention = ({ summary }: DashboardNeedsAttentionProps) => {
  const { propertyHealthSummaries } = summary;

  // Highest-risk property: regressing properties take priority,
  // then ranked by critical unfixed, then total unfixed.
  const top = [...propertyHealthSummaries].sort((a, b) => {
    const aRegressing = a.trend === "regressing" ? 1 : 0;
    const bRegressing = b.trend === "regressing" ? 1 : 0;
    if (bRegressing !== aRegressing) return bRegressing - aRegressing;
    if (b.criticalCount !== a.criticalCount) return b.criticalCount - a.criticalCount;
    return b.unfixedCount - a.unfixedCount;
  })[0];

  if (!top || top.unfixedCount === 0) return null;

  const reasons: string[] = [];
  if (top.trend === "regressing") reasons.push("Regression in latest scan");
  if (top.criticalCount > 0)
    reasons.push(
      `${top.criticalCount} critical ${top.criticalCount === 1 ? "issue" : "issues"} unfixed`,
    );

  return (
    <section aria-labelledby="needs-attention-heading">
      <div className="rounded-lg border p-4 flex flex-col gap-3">
        <h2
          id="needs-attention-heading"
          className="text-sm font-semibold tracking-tight"
        >
          Needs Attention
        </h2>

        <div>
          <p className="text-sm font-medium text-foreground">
            {top.property.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {top.property.baseUrl}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Unfixed</dt>
            <dd className="font-medium tabular-nums">{top.unfixedCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Critical</dt>
            <dd
              className={
                top.criticalCount > 0
                  ? "font-medium tabular-nums text-severity-critical"
                  : "font-medium tabular-nums text-muted-foreground"
              }
            >
              {top.criticalCount}
            </dd>
          </div>
        </dl>

        {reasons.length > 0 && (
          <ul className="flex flex-col gap-0.5" aria-label="Risk signals">
            {reasons.map((reason) => (
              <li key={reason} className="text-xs text-muted-foreground">
                · {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default DashboardNeedsAttention;
