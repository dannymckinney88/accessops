import type { DashboardSummary } from "../types/dashboard";

interface DashboardSignalsProps {
  summary: DashboardSummary;
}

const DashboardSignals = ({ summary }: DashboardSignalsProps) => {
  const {
    unfixedCount,
    criticalCount,
    highSeverityCount,
    propertyCount,
    propertiesWithCritical,
    propertiesWithIssues,
    fixedCount,
    verifiedCount,
    acceptedRiskCount,
  } = summary;

  type KpiCard = {
    label: string;
    value: number;
    subtext: (value: number) => string;
    variant?: "primary" | "standard";
    valueClassName?: (value: number) => string;
  };

  const kpiCards: KpiCard[] = [
    {
      label: "Unfixed Issues",
      value: unfixedCount,
      variant: "primary",
      subtext: () =>
        `${highSeverityCount} critical or serious · ${propertiesWithIssues} ${propertiesWithIssues === 1 ? "property" : "properties"} affected`,
    },
    {
      label: "Critical Unfixed",
      value: criticalCount,
      variant: "standard",
      valueClassName: (v) =>
        v > 0 ? "text-severity-critical" : "text-foreground",
      subtext: (v) =>
        v === 0
          ? "None currently"
          : `Across ${propertiesWithCritical} of ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`,
    },
    {
      label: "Fixed",
      value: fixedCount,
      variant: "standard",
      subtext: (v) => (v === 0 ? "No fixes pending" : "Pending re-audit"),
    },
    {
      label: "Verified",
      value: verifiedCount,
      variant: "standard",
      subtext: (v) => (v === 0 ? "None confirmed" : "Confirmed by re-audit"),
    },
    {
      label: "Accepted Risk",
      value: acceptedRiskCount, // add to destructuring at top
      variant: "standard",
      subtext: (v) => (v === 0 ? "None deferred" : "Intentionally deferred"),
    },
  ];

  return (
    <div
      role="group"
      aria-label="Accessibility health metrics"
      className="grid grid-cols-2 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4"
    >
      {kpiCards.map((card, index) => (
        <div
          key={card.label}
          className={`bg-card border border-border rounded-lg flex flex-col gap-1.5 px-5 py-4${index === 0 ? " col-span-2 md:col-span-1" : ""}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.label}
          </p>
          <p
            className={`tabular-nums leading-none ${
              card.variant === "primary"
                ? "text-4xl font-bold text-foreground"
                : "text-2xl font-semibold"
            } ${card.valueClassName?.(card.value) ?? "text-foreground"}`}
          >
            {card.value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {card.subtext(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardSignals;
