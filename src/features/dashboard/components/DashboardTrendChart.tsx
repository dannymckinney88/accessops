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

interface DashboardTrendChartProps {
  trend: DashboardTrend;
}

const DashboardTrendChart = ({ trend }: DashboardTrendChartProps) => {
  const { dataPoints, summaryText } = trend;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border p-4 pb-2">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={dataPoints}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
                border: "1px solid var(--border)",
                boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="plainline"
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total issues"
              stroke="var(--chart-5)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="critical"
              name="Critical issues"
              stroke="var(--severity-critical)"
              strokeWidth={1.75}
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">{summaryText}</p>
    </div>
  );
};

export default DashboardTrendChart;
