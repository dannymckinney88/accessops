"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardTrend } from "../types/dashboard";

// Uses chart-2 through chart-5 token values (chart-1 = oklch(0.87 0 0) is
// near-white — insufficient contrast on a light background).
// Each line also gets a distinct strokeDasharray so the chart is readable
// without relying on color differentiation alone.
const PROPERTY_STYLES = [
  { stroke: "oklch(0.269 0 0)", strokeDasharray: undefined },  // chart-5, solid
  { stroke: "oklch(0.439 0 0)", strokeDasharray: "6 3" },      // chart-3, dashed
  { stroke: "oklch(0.556 0 0)", strokeDasharray: "2 3" },      // chart-2, dotted
  { stroke: "oklch(0.371 0 0)", strokeDasharray: "8 3 2 3" },  // chart-4, dash-dot
] as const;

interface DashboardTrendChartProps {
  trend: DashboardTrend;
}

const DashboardTrendChart = ({ trend }: DashboardTrendChartProps) => {
  const { dataPoints, properties, summaryText } = trend;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border p-4 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={dataPoints}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.922 0 0)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: "6px",
                border: "1px solid oklch(0.922 0 0)",
                boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="plainline"
            />
            {properties.map((property: { id: string; name: string }, i: number) => {
              const style = PROPERTY_STYLES[i % PROPERTY_STYLES.length];
              return (
                <Line
                  key={property.id}
                  type="monotone"
                  dataKey={property.id}
                  name={property.name}
                  stroke={style.stroke}
                  strokeWidth={1.75}
                  strokeDasharray={style.strokeDasharray}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">{summaryText}</p>
    </div>
  );
};

export default DashboardTrendChart;
