import type { DashboardSummary } from "../types/dashboard";

interface DashboardSeverityBarProps {
  summary: DashboardSummary;
}

const SEVERITY_CONFIG = [
  { key: "Critical" as const, color: "var(--severity-critical)" },
  { key: "Serious" as const, color: "var(--severity-serious)" },
  { key: "Moderate" as const, color: "var(--severity-moderate)" },
  { key: "Minor" as const, color: "var(--severity-minor)" },
] as const;

const DashboardSeverityBar = ({ summary }: DashboardSeverityBarProps) => {
  const { severityDistribution, unfixedCount } = summary;

  if (unfixedCount === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No unfixed issues remaining.
      </p>
    );
  }

  // Build readable label for screen readers
  const parts = SEVERITY_CONFIG.map(({ key }) => {
    const count =
      severityDistribution.find((d) => d.severity === key)?.count ?? 0;
    return count > 0 ? `${count} ${key.toLowerCase()}` : null;
  })
    .filter(Boolean)
    .join(", ");

  // Insight: describe the dominant severity mix
  const critical =
    severityDistribution.find((d) => d.severity === "Critical")?.count ?? 0;
  const serious =
    severityDistribution.find((d) => d.severity === "Serious")?.count ?? 0;
  const highPct =
    unfixedCount > 0
      ? Math.round(((critical + serious) / unfixedCount) * 100)
      : 0;

  const insightText =
    highPct >= 80
      ? "Most issues are critical and serious — high user impact"
      : highPct >= 50
        ? "Majority of issues are high severity — prioritise these first"
        : "Severity mix is moderate — review critical items first";

  return (
    <div className="flex flex-col gap-4">
      {/* Stacked horizontal bar */}
      <div
        role="img"
        aria-label={`Unfixed by severity: ${parts}`}
        className="flex h-8 w-full overflow-hidden rounded-md"
      >
        {SEVERITY_CONFIG.map(({ key, color }) => {
          const count =
            severityDistribution.find((d) => d.severity === key)?.count ?? 0;
          if (count === 0) return null;
          const pct = (count / unfixedCount) * 100;
          return (
            <div
              key={key}
              className="flex h-full items-center justify-center"
              style={{ width: `${pct}%`, background: color }}
            >
              {/* Only show count label if segment is wide enough */}
              {pct >= 10 && (
                <span className="text-xs font-semibold tabular-nums text-white dark:text-black/80">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-x-5 gap-y-1.5"
        aria-label="Severity legend"
      >
        {SEVERITY_CONFIG.map(({ key, color }) => {
          const count =
            severityDistribution.find((d) => d.severity === key)?.count ?? 0;
          if (count === 0) return null;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">{key}</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <p className="text-xs text-muted-foreground">{insightText}</p>
    </div>
  );
};

export default DashboardSeverityBar;
