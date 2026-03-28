import type { DashboardSummary } from "../types/dashboard";

interface DashboardPortfolioSnapshotProps {
  summary: DashboardSummary;
}

const DashboardPortfolioSnapshot = ({
  summary,
}: DashboardPortfolioSnapshotProps) => {
  const {
    totalViolations,
    propertyCount,
    unfixedCount,
    fixedCount,
    verifiedCount,
    acceptedRiskCount,
  } = summary;

  const rows: { label: string; value: number }[] = [
    { label: "Unfixed", value: unfixedCount },
    { label: "Fixed (pending)", value: fixedCount },
    { label: "Verified", value: verifiedCount },
    ...(acceptedRiskCount > 0
      ? [{ label: "Accepted risk", value: acceptedRiskCount }]
      : []),
  ];

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3 h-full">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Portfolio Snapshot
      </p>

      <p className="text-xs text-muted-foreground">
        {totalViolations} violations · {propertyCount}{" "}
        {propertyCount === 1 ? "property" : "properties"}
      </p>

      <ul className="flex flex-col gap-1.5 mt-auto">
        {rows.map(({ label, value }) => (
          <li key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="tabular-nums font-medium text-foreground">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPortfolioSnapshot;
