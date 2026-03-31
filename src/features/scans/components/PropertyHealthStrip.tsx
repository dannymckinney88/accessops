import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { PropertyHealthItem } from "@/lib/data";

interface PropertyHealthStripProps {
  items: PropertyHealthItem[];
}

type RiskState = {
  label: string;
  labelClass: string;
  TrendIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trendLabel: string;
};

// Derives a display-ready risk state from lifecycle counts and trend direction.
// Risk label is based on remaining severity, not trend alone — a stagnant
// property with critical issues is "High Risk" regardless of trend direction.
const getRiskState = (item: PropertyHealthItem): RiskState => {
  const TrendIcon =
    item.trend === "regressing"
      ? TrendingUp
      : item.trend === "improving"
        ? TrendingDown
        : Minus;

  const trendLabel =
    item.trend === "regressing"
      ? "Regressing"
      : item.trend === "improving"
        ? "Improving"
        : item.trend === "stable"
          ? "Stable"
          : "";

  if (item.remainingIssues === 0) {
    return {
      label: "Clean",
      labelClass: "text-trend-improving",
      TrendIcon: TrendingDown,
      trendLabel: "Improving",
    };
  }

  if (item.trend === "regressing") {
    return {
      label: "Regressing",
      labelClass: "text-trend-regressing",
      TrendIcon,
      trendLabel,
    };
  }

  if (item.criticalRemaining > 0) {
    return {
      label: "High Risk",
      labelClass: "text-severity-critical",
      TrendIcon,
      trendLabel,
    };
  }

  return {
    label: "At Risk",
    labelClass: "text-severity-serious",
    TrendIcon,
    trendLabel,
  };
};

const PropertyHealthStrip = ({ items }: PropertyHealthStripProps) => {
  return (
    <div
      role="list"
      aria-label="Current health by property"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {items.map((item) => {
        const risk = getRiskState(item);
        const { TrendIcon } = risk;

        return (
          <div
            key={item.property.id}
            role="listitem"
            className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3"
          >
            {/* Property name + risk state label */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug text-foreground">
                {item.property.name}
              </p>
              <span
                className={`flex shrink-0 items-center gap-1 text-xs font-medium ${risk.labelClass}`}
              >
                <TrendIcon
                  className="size-3.5"
                  aria-hidden="true"
                />
                <span>{risk.label}</span>
                <span className="sr-only">
                  {risk.trendLabel ? `· trend: ${risk.trendLabel}` : ""}
                </span>
              </span>
            </div>

            {/* Remaining count + critical count */}
            <div className="flex items-baseline gap-3">
              <span>
                <span
                  className={`text-xl font-semibold tabular-nums ${
                    item.remainingIssues === 0
                      ? "text-trend-improving"
                      : "text-foreground"
                  }`}
                >
                  {item.remainingIssues}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  remaining
                </span>
              </span>

              {item.criticalRemaining > 0 && (
                <span
                  className="flex items-center gap-1 text-xs font-medium text-severity-critical"
                  aria-label={`${item.criticalRemaining} critical remaining`}
                >
                  <AlertTriangle
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">{item.criticalRemaining}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyHealthStrip;
