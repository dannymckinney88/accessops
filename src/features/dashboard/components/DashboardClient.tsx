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

  // Surface the regressing property in the top alert if one exists.
  const regressingProperty = propertyHealthSummaries.find(
    (s) => s.trend === "regressing",
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader subtitle={subtitle} />

      {/* ── Alert strip ─────────────────────────────────────────────────── */}
      {regressingProperty && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-4 rounded-lg border border-severity-critical/30 bg-severity-critical/[0.06] px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="size-4 shrink-0 text-severity-critical"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-severity-critical">
              <span className="font-semibold">
                {regressingProperty.property.name}
              </span>
              {regressingProperty.criticalCount > 0
                ? ` is regressing · ${regressingProperty.criticalCount} critical ${regressingProperty.criticalCount === 1 ? "issue" : "issues"} still unresolved`
                : " is regressing — violation count increased since last audit"}
            </p>
          </div>
          <a
            href="/issues"
            className="shrink-0 text-xs font-medium text-severity-critical underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            View issues →
          </a>
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <DashboardSignals summary={summary} />

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        {/* Left column: charts */}
        <div className="flex flex-col gap-5">
          {/* Unfixed by Severity */}
          <section
            aria-labelledby="severity-bar-heading"
            className="rounded-lg border bg-card p-5"
          >
            <h2
              id="severity-bar-heading"
              className="text-sm font-semibold text-foreground"
            >
              Unfixed by Severity
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Active issues requiring remediation
            </p>
            <div className="mt-4">
              <DashboardSeverityBar summary={summary} />
            </div>
          </section>

          {/* Remediation Progress */}
          <section
            aria-labelledby="remediation-progress-heading"
            className="rounded-lg border bg-card p-5"
          >
            <h2
              id="remediation-progress-heading"
              className="text-sm font-semibold text-foreground"
            >
              Remediation Progress
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Issues by lifecycle state
            </p>
            <div className="mt-4">
              <DashboardAuditProgress summary={summary} />
            </div>
          </section>
        </div>

        {/* Right column: property health + highest risk */}
        <div className="rounded-lg border bg-card p-5 flex flex-col gap-5">
          {/* Property Health */}
          <section aria-labelledby="property-health-heading">
            <h2
              id="property-health-heading"
              className="text-sm font-semibold text-foreground"
            >
              Property Health
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Top 3 by risk · sorted by critical + remaining
            </p>
            <div className="mt-4">
              <DashboardPropertyHealth summary={summary} />
            </div>
          </section>

          <div className="border-t border-border/60" />

          {/* Highest Risk Right Now */}
          <section aria-labelledby="highest-risk-heading">
            <h2
              id="highest-risk-heading"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Highest Risk Right Now
            </h2>
            <div className="mt-3">
              <DashboardHighestRisk summary={summary} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
