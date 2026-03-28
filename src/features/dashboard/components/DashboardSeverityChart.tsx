"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { SeverityDistributionPoint } from "../types/dashboard";

// Severity fill values map directly to existing domain tokens.
// var(--severity-*) works as a Recharts fill because Recharts applies it as
// an inline style, which resolves CSS custom properties correctly.
const SEVERITY_FILL: Record<SeverityDistributionPoint["severity"], string> = {
  Critical: "var(--severity-critical)",
  Serious: "var(--severity-serious)",
  Moderate: "var(--severity-moderate)",
  Minor: "var(--severity-minor)",
};

interface DashboardSeverityChartProps {
  distribution: SeverityDistributionPoint[];
  totalViolations: number;
  highSeverityCount: number;
}

const DashboardSeverityChart = ({
  distribution,
  totalViolations,
  highSeverityCount,
}: DashboardSeverityChartProps) => {
  const summaryText =
    highSeverityCount > 0
      ? `${highSeverityCount} of ${totalViolations} unfixed issues are critical or serious.`
      : `No critical or serious issues in the current scope.`;

  return (
    <div className="rounded-lg border p-5 flex flex-col gap-5">
      <div className="flex items-center gap-6">
        {/* Donut — fixed size so the center label overlay stays aligned */}
        <div className="relative shrink-0">
          <PieChart width={150} height={150}>
            <Pie
              data={distribution}
              cx={75}
              cy={75}
              innerRadius={50}
              outerRadius={70}
              dataKey="count"
              nameKey="severity"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {distribution.map((entry) => (
                <Cell key={entry.severity} fill={SEVERITY_FILL[entry.severity]} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              contentStyle={{
                fontSize: 12,
                borderRadius: "6px",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </PieChart>
          {/* Center label overlaid on the donut hole */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums leading-none">
              {totalViolations}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">unfixed</span>
          </div>
        </div>

        {/* Inline legend */}
        <div className="flex-1 flex flex-col gap-2.5">
          {distribution.map((entry) => {
            const pct =
              totalViolations > 0
                ? Math.round((entry.count / totalViolations) * 100)
                : 0;
            return (
              <div key={entry.severity} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: SEVERITY_FILL[entry.severity] }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{entry.severity}</span>
                <span className="ml-auto tabular-nums font-medium">
                  {entry.count}
                </span>
                <span className="w-9 text-right text-xs text-muted-foreground">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="border-t pt-4 text-sm text-muted-foreground">{summaryText}</p>
    </div>
  );
};

export default DashboardSeverityChart;
