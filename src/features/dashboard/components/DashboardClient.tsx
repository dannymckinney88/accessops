import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSignals from "./DashboardSignals";
import DashboardTopCriticalPattern from "./DashboardTopCriticalPattern";
import DashboardCriticalByProperty from "./DashboardCriticalByProperty";
import DashboardTopPages from "./DashboardTopPages";
import DashboardAuditProgress from "./DashboardAuditProgress";
import DashboardSeverityByProperty from "./DashboardSeverityByProperty";
import DashboardPropertyHealth from "./DashboardPropertyHealth";

interface DashboardClientProps {
  summary: DashboardSummary;
}

const DashboardClient = ({ summary }: DashboardClientProps) => {
  const { unfixedCount, criticalCount, propertiesWithIssues } = summary;

  // Subtitle reflects work still remaining — unfixed issues, not baseline total.
  const subtitle =
    `${unfixedCount} unfixed ${unfixedCount === 1 ? "issue" : "issues"} across ${propertiesWithIssues} ${propertiesWithIssues === 1 ? "property" : "properties"}` +
    (criticalCount > 0 ? ` · ${criticalCount} critical` : "");

  return (
    <div className="w-full flex flex-col gap-6">
      <DashboardHeader subtitle={subtitle} />

      {/* Row 1: KPI strip + supporting signal cards */}
      <section aria-labelledby="signals-heading" className="flex flex-col gap-4">
        <h2
          id="signals-heading"
          className="text-base font-semibold tracking-tight"
        >
          Current Accessibility Health
        </h2>
        <DashboardSignals summary={summary} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DashboardTopCriticalPattern summary={summary} />
          <DashboardCriticalByProperty summary={summary} />
          <DashboardTopPages summary={summary} />
        </div>
      </section>

      {/* Row 2: Two chart panels */}
      <div className="grid grid-cols-2 gap-4">
        <section
          aria-labelledby="severity-by-property-heading"
          className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4"
        >
          <h2
            id="severity-by-property-heading"
            className="text-sm font-semibold text-foreground"
          >
            Severity by Property
          </h2>
          <DashboardSeverityByProperty summary={summary} />
        </section>

        <section
          aria-labelledby="audit-progress-heading"
          className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4"
        >
          <h2
            id="audit-progress-heading"
            className="text-sm font-semibold text-foreground"
          >
            Audit Progress
          </h2>
          <DashboardAuditProgress summary={summary} />
        </section>
      </div>

      {/* Row 3: Property Health — full width */}
      <section aria-labelledby="property-health-heading">
        <h2
          id="property-health-heading"
          className="mb-1 text-base font-semibold tracking-tight"
        >
          Property Health
        </h2>
        <p
          id="property-health-description"
          className="mb-4 text-sm text-muted-foreground"
        >
          Ranked by unfixed issues · current audit scope
        </p>
        <DashboardPropertyHealth summary={summary} />
      </section>
    </div>
  );
};

export default DashboardClient;
