"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";
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
      ? `${highSeverityCount} of ${totalViolations} issues are critical or serious — these need priority attention.`
      : `No critical or serious issues across tracked properties.`;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border p-4 pb-2">
        <ResponsiveContainer width="100%" height={152}>
          <BarChart
            layout="vertical"
            data={distribution}
            margin={{ top: 0, right: 36, bottom: 0, left: 4 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="severity"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                fontSize: 12,
                borderRadius: "6px",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
              }}
            />
            <Bar
              dataKey="count"
              name="Issues"
              radius={[0, 3, 3, 0]}
              label={{
                position: "right",
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
            >
              {distribution.map((entry) => (
                <Cell
                  key={entry.severity}
                  fill={SEVERITY_FILL[entry.severity]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">{summaryText}</p>
    </div>
  );
};

export default DashboardSeverityChart;
