import { AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSignals from "./DashboardSignals";
import DashboardSeverityBar from "./DashboardSeverityBar";
import DashboardAuditProgress from "./DashboardAuditProgress";
import DashboardPropertyHealth from "./DashboardPropertyHealth";
import DashboardHighestRisk from "./DashboardHighestRisk";

interface DashboardClientProps {
  summary: DashboardSummary;
}

const DashboardClient = ({ summary }: DashboardClientProps) => {
  const {
    unfixedCount,
    criticalCount,
    propertiesWithIssues,
    propertyHealthSummaries,
  } = summary;

  const subtitle =
    `${unfixedCount} unfixed ${unfixedCount === 1 ? "issue" : "issues"} across ` +
    `${propertiesWithIssues} ${propertiesWithIssues === 1 ? "property" : "properties"}` +
    (criticalCount > 0 ? ` · ${criticalCount} critical` : "");

  const regressingProperty = propertyHealthSummaries.find(
    (s) => s.trend === "regressing",
  );
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <DashboardHeader subtitle={subtitle} />

      {/* Alert strip - Tightened padding */}
      {regressingProperty && (
        <div className="flex items-center justify-between border border-severity-critical/20 bg-severity-critical/[0.02] px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-severity-critical" />
            <p className="text-sm font-medium text-severity-critical">
              <span className="font-bold">
                {regressingProperty.property.name}
              </span>{" "}
              is regressing
            </p>
          </div>
          <a
            href="/issues"
            className="text-xs font-bold text-severity-critical hover:underline"
          >
            View issues →
          </a>
        </div>
      )}

      <DashboardSignals summary={summary} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px] items-stretch">
        {/* Left Column: Property Health  */}
        <section
          aria-labelledby="property-health-heading"
          className="flex flex-col h-full rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex-1">
            <h2
              id="property-health-heading"
              className="text-sm font-semibold text-foreground"
            >
              Property Health
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sorted by critical count and remaining remediation work
            </p>
            <div className="mt-6">
              <DashboardPropertyHealth summary={summary} />
            </div>
          </div>
        </section>

        {/* Right Column: Immediate Fixes  */}
        <section
          aria-labelledby="highest-risk-heading"
          className="flex flex-col h-full rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex-1">
            <h2
              id="highest-risk-heading"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Top Risk Pages
            </h2>

            <DashboardHighestRisk summary={summary} />
          </div>
        </section>
      </div>
      {/* SECONDARY ANALYTICS - Visually Quieter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
        <section className="rounded-xl border bg-card/30 p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-4">
            Unfixed by Severity
          </h2>
          <DashboardSeverityBar summary={summary} />
        </section>

        <section className="rounded-xl border bg-card/30 p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-4">
            Remediation Progress
          </h2>
          <DashboardAuditProgress summary={summary} />
        </section>
      </div>
    </div>
  );
};
export default DashboardClient;
