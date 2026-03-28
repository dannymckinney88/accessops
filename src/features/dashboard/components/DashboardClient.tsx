import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSignals from "./DashboardSignals";
import DashboardTopCriticalPattern from "./DashboardTopCriticalPattern";
import DashboardCriticalByProperty from "./DashboardCriticalByProperty";
import DashboardTopPages from "./DashboardTopPages";
import DashboardAuditProgress from "./DashboardAuditProgress";
import DashboardSeverityByProperty from "./DashboardSeverityByProperty";
import DashboardPropertyHealth from "./DashboardPropertyHealth";
import DashboardCriticalAlert from "./DashboardCriticalAlert";
import DashboardNeedsAttention from "./DashboardNeedsAttention";

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
    <div className="w-full flex flex-col gap-8">
      <DashboardHeader subtitle={subtitle} />

      <div className="flex flex-col gap-8">
        {/* Top summary zone: full-width KPI strip + supporting signal cards */}
        <section
          aria-labelledby="signals-heading"
          className="flex flex-col gap-3"
        >
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

        {/* Main content grid: left analysis column + right action column */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
          {/* Left analysis column */}
          <div className="flex flex-col gap-8">
            {/* Audit Progress + Severity by Property */}
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.6fr_1fr]">
              <section
                aria-labelledby="audit-progress-heading"
                className="flex flex-col"
              >
                <h2
                  id="audit-progress-heading"
                  className="mb-4 text-base font-semibold tracking-tight"
                >
                  Audit Progress
                </h2>
                <div className="flex h-full rounded-lg border p-5">
                  <DashboardAuditProgress summary={summary} />
                </div>
              </section>

              <section
                aria-labelledby="severity-by-property-heading"
                className="flex flex-col"
              >
                <h2
                  id="severity-by-property-heading"
                  className="mb-4 text-base font-semibold tracking-tight"
                >
                  Severity by Property
                </h2>
                <div className="flex h-full">
                  <DashboardSeverityByProperty summary={summary} />
                </div>
              </section>
            </div>

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
                Ranked by unfixed issues · current audit scope
              </p>
              <DashboardPropertyHealth summary={summary} />
            </section>
          </div>

          {/* Right action column */}
          <div className="flex flex-col gap-4 lg:pt-10">
            <DashboardCriticalAlert summary={summary} />
            <DashboardNeedsAttention summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
