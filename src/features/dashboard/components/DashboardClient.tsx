"use client";

import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";

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
          Summary
        </h2>
        {/* Signal cards — Phase 2 */}
      </section>

      <section aria-labelledby="property-health-heading">
        <h2
          id="property-health-heading"
          className="mb-4 text-base font-semibold tracking-tight"
        >
          Property Health
        </h2>
        {/* Property health rows — Phase 2 */}
      </section>
    </div>
  );
};

export default DashboardClient;
