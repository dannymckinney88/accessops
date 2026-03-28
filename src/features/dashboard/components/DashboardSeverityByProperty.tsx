import type { DashboardSummary } from "../types/dashboard";

interface DashboardSeverityByPropertyProps {
  summary: DashboardSummary;
}

const SEVERITY_BARS = [
  {
    key: "critical" as const,
    label: "Critical",
    color: "var(--severity-critical)",
  },
  {
    key: "serious" as const,
    label: "Serious",
    color: "var(--severity-serious)",
  },
  {
    key: "moderate" as const,
    label: "Moderate",
    color: "var(--severity-moderate)",
  },
  { key: "minor" as const, label: "Minor", color: "var(--severity-minor)" },
];

const DashboardSeverityByProperty = ({
  summary,
}: DashboardSeverityByPropertyProps) => {
  const { severityByProperty, severityDistribution } = summary;

  if (severityByProperty.length === 0) {
    return (
      <div className="rounded-lg border p-5 flex items-center h-full">
        <p className="text-sm text-muted-foreground">No unfixed issues</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-5 flex flex-col gap-5 flex-1">
      {/* Legend: severity → color + total count */}
      <div
        className="flex flex-wrap gap-x-5 gap-y-1.5"
        aria-label="Severity colour legend"
      >
        {SEVERITY_BARS.map(({ key, label, color }) => {
          const total =
            severityDistribution.find((d) => d.severity.toLowerCase() === key)
              ?.count ?? 0;
          if (total === 0) return null;
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums font-medium text-foreground">
                {total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-property rows */}
      <ul
        className="flex flex-col gap-4"
        aria-label="Severity breakdown by property"
      >
        {severityByProperty.map((p) => {
          // Build visible text parts — only include non-zero severities
          const parts = SEVERITY_BARS.map(({ key, label }) =>
            p[key] > 0 ? `${p[key]} ${label.toLowerCase()}` : null,
          ).filter(Boolean) as string[];

          const summaryText = `${p.propertyName} — ${parts.join(", ")}`;

          return (
            <li key={p.propertyId}>
              {/* Single coherent summary for screen readers */}
              <p className="sr-only">{summaryText}</p>

              {/* Visual presentation */}
              <div aria-hidden="true" className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-foreground">
                  {p.propertyName}
                </p>

                {/* Stacked bar */}
                <div className="flex h-4 w-full overflow-hidden rounded-sm">
                  {SEVERITY_BARS.map(({ key, color }) => {
                    if (p[key] === 0) return null;
                    const widthPct = (p[key] / p.total) * 100;
                    return (
                      <div
                        key={key}
                        className="h-full"
                        style={{
                          width: `${widthPct}%`,
                          background: color,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Text summary */}
                <p className="text-xs text-muted-foreground">
                  {parts.join(" · ")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardSeverityByProperty;
