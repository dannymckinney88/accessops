import type { DashboardSummary } from "../types/dashboard";

interface DashboardAuditProgressProps {
  summary: DashboardSummary;
}

interface SegmentProps {
  color: string;
  label: string;
  count: number;
  description: string;
}

const Segment = ({ color, label, count, description }: SegmentProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="text-sm font-medium tabular-nums">{count}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="pl-5 text-xs text-muted-foreground">{description}</p>
  </div>
);

const DashboardAuditProgress = ({ summary }: DashboardAuditProgressProps) => {
  const {
    totalViolations,
    unfixedCount,
    fixedCount,
    verifiedCount,
    acceptedRiskCount,
  } = summary;

  // Proportional widths — clamp to avoid sub-pixel gaps on rounding.
  const verifiedPct = totalViolations > 0 ? (verifiedCount / totalViolations) * 100 : 0;
  const fixedPct = totalViolations > 0 ? (fixedCount / totalViolations) * 100 : 0;
  const acceptedPct = totalViolations > 0 ? (acceptedRiskCount / totalViolations) * 100 : 0;
  // Unfixed takes the remainder to ensure the bar always fills 100%.
  const unfixedPct = Math.max(0, 100 - verifiedPct - fixedPct - acceptedPct);

  const resolvedCount = verifiedCount + fixedCount;
  const resolvedPct =
    totalViolations > 0 ? Math.round((resolvedCount / totalViolations) * 100) : 0;

  const ariaLabel = [
    `${totalViolations} total issues in the current audit baseline.`,
    `${verifiedCount} verified resolved.`,
    `${fixedCount} fixed and awaiting verification.`,
    `${unfixedCount} still require remediation.`,
    acceptedRiskCount > 0 ? `${acceptedRiskCount} accepted as known risk.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar — order: verified | fixed | accepted-risk | unfixed (dominant remainder) */}
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-5 w-full overflow-hidden rounded-full"
      >
        {verifiedPct > 0 && (
          <div
            className="h-full"
            style={{
              width: `${verifiedPct}%`,
              background: "var(--status-verified)",
            }}
          />
        )}
        {fixedPct > 0 && (
          <div
            className="h-full"
            style={{
              width: `${fixedPct}%`,
              background: "var(--status-fixed)",
            }}
          />
        )}
        {acceptedPct > 0 && (
          <div
            className="h-full"
            style={{
              width: `${acceptedPct}%`,
              background: "var(--status-accepted-risk)",
            }}
          />
        )}
        <div
          className="h-full flex-1 bg-muted"
          style={unfixedPct === 100 ? { width: "100%" } : undefined}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Segment
          color="var(--status-verified)"
          label="Verified"
          count={verifiedCount}
          description="Confirmed by re-audit"
        />
        <Segment
          color="var(--status-fixed)"
          label="Fixed"
          count={fixedCount}
          description="Awaiting re-audit"
        />
        <Segment
          color="var(--status-accepted-risk)"
          label="Accepted Risk"
          count={acceptedRiskCount}
          description="Intentionally excluded"
        />
        <Segment
          color="var(--muted-foreground)"
          label="Unfixed"
          count={unfixedCount}
          description="Still requires remediation"
        />
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>{totalViolations} issues in the current audit baseline.</p>
        {unfixedCount === totalViolations ? (
          <p>Remediation has not yet started.</p>
        ) : (
          <>
            <p>
              {resolvedCount} addressed so far ({resolvedPct}%)
              {verifiedCount > 0 && fixedCount > 0 &&
                ` — ${verifiedCount} verified, ${fixedCount} awaiting re-audit.`}
              {verifiedCount > 0 && fixedCount === 0 && ` — all confirmed by re-audit.`}
              {verifiedCount === 0 && fixedCount > 0 && ` — awaiting re-audit.`}
              {verifiedCount === 0 && fixedCount === 0 && `.`}
            </p>
            <p>
              {unfixedCount} {unfixedCount === 1 ? "issue" : "issues"} still{" "}
              {unfixedCount === 1 ? "requires" : "require"} remediation.
            </p>
          </>
        )}
        {acceptedRiskCount > 0 && (
          <p>{acceptedRiskCount} accepted as known risk.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAuditProgress;
