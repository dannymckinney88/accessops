import type { DashboardSummary } from "../types/dashboard";

interface DashboardAuditProgressProps {
  summary: DashboardSummary;
}

const DashboardAuditProgress = ({ summary }: DashboardAuditProgressProps) => {
  const {
    openCount,
    inProgressCount,
    fixedCount,
    verifiedCount,
    acceptedRiskCount,
    totalViolations,
  } = summary;

  const rows: Array<{
    label: string;
    count: number;
    color: string;
    ariaDesc: string;
  }> = [
    {
      label: "Open",
      count: openCount,
      color: "var(--status-open)",
      ariaDesc: "unstarted violations",
    },
    {
      label: "In Progress",
      count: inProgressCount,
      color: "var(--status-in-progress)",
      ariaDesc: "violations actively being remediated",
    },
    {
      label: "Fixed",
      count: fixedCount,
      color: "var(--status-fixed)",
      ariaDesc: "violations fixed internally, awaiting re-audit",
    },
    {
      label: "Verified",
      count: verifiedCount,
      color: "var(--status-verified)",
      ariaDesc: "violations confirmed resolved by re-audit",
    },
    {
      label: "Accepted Risk",
      count: acceptedRiskCount,
      color: "var(--status-accepted-risk)",
      ariaDesc: "violations intentionally accepted as known risk",
    },
  ].filter((r) => r.count > 0 || r.label === "Open");

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  // Derive insight from the open/fixed ratio
  const addressedCount = fixedCount + verifiedCount;
  const addressedPct =
    totalViolations > 0
      ? Math.round((addressedCount / totalViolations) * 100)
      : 0;

  const insightText =
    addressedPct === 0
      ? "No remediation progress yet — all issues remain open"
      : addressedPct < 20
        ? "Most issues are still open — limited remediation progress so far"
        : addressedPct < 50
          ? `${addressedPct}% addressed — remediation is underway`
          : `${addressedPct}% addressed — strong remediation progress`;

  return (
    <div className="flex flex-col gap-4">
      {/* Bar rows */}
      <dl
        className="flex flex-col gap-2.5"
        aria-label="Violation counts by lifecycle state"
      >
        {rows.map(({ label, count, color, ariaDesc }) => {
          const barPct = (count / maxCount) * 100;
          return (
            <div key={label} className="grid grid-cols-[80px_1fr_32px] items-center gap-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="flex items-center gap-2" aria-label={`${count} ${ariaDesc}`}>
                <div className="h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                  {count > 0 && (
                    <div
                      className="h-full rounded-sm transition-all duration-300"
                      style={{
                        width: `${barPct}%`,
                        background: color,
                      }}
                    />
                  )}
                </div>
              </dd>
              <dd
                className="text-right text-xs tabular-nums font-medium text-foreground"
                aria-hidden="true"
              >
                {count}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* x-axis tick labels */}
      <div className="grid grid-cols-[80px_1fr_32px] gap-3" aria-hidden="true">
        <div />
        <div className="flex justify-between px-0.5 text-[10px] text-muted-foreground/60">
          <span>0</span>
          <span>{Math.round(maxCount / 2)}</span>
          <span>{maxCount}</span>
        </div>
        <div />
      </div>

      {/* Insight */}
      <p className="text-xs text-muted-foreground">{insightText}</p>
    </div>
  );
};

export default DashboardAuditProgress;
