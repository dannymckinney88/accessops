"use client";

import { useState } from "react";
import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSignals from "./DashboardSignals";
import DashboardTrendChart from "./DashboardTrendChart";
import TrendRangeControl, { type TrendRange } from "./TrendRangeControl";
import DashboardSeverityChart from "./DashboardSeverityChart";
import DashboardPropertyHealth from "./DashboardPropertyHealth";

interface DashboardClientProps {
  summary: DashboardSummary;
}

const DashboardClient = ({ summary }: DashboardClientProps) => {
  const { totalViolations, criticalCount, propertyCount } = summary;
  const [trendRange, setTrendRange] = useState<TrendRange>("all");

  const affectedCount = summary.propertiesWithIssues;
  const subtitle =
    `${totalViolations} issues across ${affectedCount} ${affectedCount === 1 ? "property" : "properties"}` +
    (criticalCount > 0 ? ` · ${criticalCount} critical` : "");

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col gap-8">
      <DashboardHeader subtitle={subtitle} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Left column — primary content */}
        <div className="flex flex-col gap-8">
          <section aria-labelledby="signals-heading">
            <h2
              id="signals-heading"
              className="mb-4 text-base font-semibold tracking-tight"
            >
              Current Accessibility Health
            </h2>
            <DashboardSignals summary={summary} />
          </section>

          <section aria-labelledby="issue-trend-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="issue-trend-heading"
                className="text-base font-semibold tracking-tight"
              >
                Issue Trend
              </h2>
              <TrendRangeControl range={trendRange} onChange={setTrendRange} />
            </div>
            <DashboardTrendChart trend={summary.trend} range={trendRange} />
          </section>

          <section aria-labelledby="severity-distribution-heading">
            <h2
              id="severity-distribution-heading"
              className="mb-4 text-base font-semibold tracking-tight"
            >
              Severity Distribution
            </h2>
            <DashboardSeverityChart
              distribution={summary.severityDistribution}
              totalViolations={summary.totalViolations}
            />
          </section>

          <section aria-labelledby="property-health-heading">
            <h2
              id="property-health-heading"
              className="mb-1 text-base font-semibold tracking-tight"
            >
              Property Health
            </h2>
            <p
              className="mb-4 text-sm text-muted-foreground"
              id="property-health-description"
            >
              Ranked by current issues — latest scan per property
            </p>
            <DashboardPropertyHealth summary={summary} />
          </section>
        </div>

        {/* Right column — contextual panels (future phases) */}
        <div className="flex flex-col gap-8" />
      </div>
    </div>
  );
};

export default DashboardClient;
