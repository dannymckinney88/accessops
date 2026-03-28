"use client";

import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSignals from "./DashboardSignals";
import DashboardPropertyHealth from "./DashboardPropertyHealth";

interface DashboardClientProps {
  summary: DashboardSummary;
}

const DashboardClient = ({ summary }: DashboardClientProps) => {
  const { totalViolations, criticalCount, propertyCount } = summary;

  const subtitle =
    `${totalViolations} issues across ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}` +
    (criticalCount > 0 ? ` · ${criticalCount} critical` : "");

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader subtitle={subtitle} />

      <section aria-labelledby="signals-heading">
        <h2
          id="signals-heading"
          className="mb-4 text-base font-semibold tracking-tight"
        >
          Accessibility Overview
        </h2>
        <DashboardSignals summary={summary} />
      </section>

      <section aria-labelledby="property-health-heading">
        <h2
          id="property-health-heading"
          className="mb-4 text-base font-semibold tracking-tight"
        >
          Property Health
        </h2>
        <DashboardPropertyHealth summary={summary} />
      </section>
    </div>
  );
};

export default DashboardClient;
