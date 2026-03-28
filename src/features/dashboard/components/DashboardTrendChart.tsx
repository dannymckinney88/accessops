"use client";

import { useMemo } from "react";
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
import type { TrendRange } from "./TrendRangeControl";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const RANGE_LABELS: Record<string, string> = {
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
};

interface DashboardTrendChartProps {
  trend: DashboardTrend;
  range: TrendRange;
}

const DashboardTrendChart = ({ trend, range }: DashboardTrendChartProps) => {
  const filteredPoints = useMemo(() => {
    if (range === "all") return trend.dataPoints;
    const days = RANGE_DAYS[range];
    if (!days) return trend.dataPoints;
    const last = trend.dataPoints[trend.dataPoints.length - 1];
    if (!last) return [];
    const cutoff = new Date(last.date).getTime() - days * 24 * 60 * 60 * 1000;
    return trend.dataPoints.filter(
      (p) => new Date(p.date).getTime() >= cutoff,
    );
  }, [trend.dataPoints, range]);

  const summaryText = useMemo(() => {
    if (range === "all") return trend.summaryText;

    if (filteredPoints.length === 0) {
      return `No scan data in the last ${range}. Select a wider range.`;
    }
    if (filteredPoints.length === 1) {
      return `Only one scan in the last ${range}. Select a wider range to see a trend.`;
    }

    const first = filteredPoints[0]!;
    const last = filteredPoints[filteredPoints.length - 1]!;
    const totalDelta = last.total - first.total;
    const criticalDelta = last.critical - first.critical;
    const rangeLabel = RANGE_LABELS[range] ?? "this period";

    const totalTrend =
      totalDelta < 0
        ? `Issues down ${Math.abs(totalDelta)} over ${rangeLabel}`
        : totalDelta > 0
          ? `Issues up ${totalDelta} over ${rangeLabel}`
          : `Issue count stable over ${rangeLabel}`;

    const criticalTrend =
      criticalDelta < 0
        ? `critical down ${Math.abs(criticalDelta)}`
        : criticalDelta > 0
          ? `critical up ${criticalDelta}`
          : `critical stable`;

    return `${totalTrend}; ${criticalTrend}.`;
  }, [range, filteredPoints, trend.summaryText]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border p-4 pb-2">
        {filteredPoints.length < 2 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-sm text-muted-foreground">{summaryText}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={filteredPoints}
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
        )}
      </div>
      {filteredPoints.length >= 2 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{summaryText}</p>
          {trend.attributionText && range === "all" && (
            <p className="text-sm text-foreground">
              {trend.attributionText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardTrendChart;
