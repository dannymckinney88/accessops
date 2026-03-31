import type { DashboardSummary } from "../types/dashboard";

interface DashboardSignalsProps {
  summary: DashboardSummary;
}

const DashboardSignals = ({ summary }: DashboardSignalsProps) => {
  const { unfixedCount, criticalCount, fixedCount, verifiedCount } = summary;

  return (
    <div
      role="group"
      aria-label="Accessibility health metrics"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {/* Unfixed Issues */}
      <div className="rounded-lg border bg-card px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Unfixed Issues
        </p>
        <p className="mt-1.5 text-4xl font-bold tabular-nums leading-none text-foreground">
          {unfixedCount}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">Open + In Progress</p>
      </div>

      {/* Critical Unfixed */}
      <div className="rounded-lg border bg-card px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Critical Unfixed
        </p>
        <p
          className={`mt-1.5 text-4xl font-bold tabular-nums leading-none ${
            criticalCount > 0 ? "text-severity-critical" : "text-foreground"
          }`}
        >
          {criticalCount}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">Highest urgency</p>
      </div>

      {/* Fixed (Awaiting Verify) */}
      <div className="rounded-lg border bg-card px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Fixed (Awaiting Verify)
        </p>
        <p className="mt-1.5 text-4xl font-bold tabular-nums leading-none text-foreground">
          {fixedCount}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {fixedCount === 0 ? "No fixes pending" : "Completed internally"}
        </p>
      </div>

      {/* Verified */}
      <div className="rounded-lg border bg-card px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Verified
        </p>
        <p className="mt-1.5 text-4xl font-bold tabular-nums leading-none text-foreground">
          {verifiedCount}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {verifiedCount === 0 ? "None confirmed" : "Confirmed by re-audit"}
        </p>
      </div>
    </div>
  );
};

export default DashboardSignals;
