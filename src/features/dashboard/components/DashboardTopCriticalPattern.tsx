import type { DashboardSummary } from "../types/dashboard";

interface DashboardTopCriticalPatternProps {
  summary: DashboardSummary;
}

const DashboardTopCriticalPattern = ({
  summary,
}: DashboardTopCriticalPatternProps) => {
  const { topCriticalRule, criticalCount } = summary;

  if (!topCriticalRule) {
    return (
      <div className="rounded-lg border p-4 flex items-center h-full">
        <p className="text-sm text-muted-foreground">
          No critical issues unfixed
        </p>
      </div>
    );
  }

  const { help, count, propertyCount, pageCount, topPropertyName } =
    topCriticalRule;
  const pct = criticalCount > 0 ? Math.round((count / criticalCount) * 100) : 0;
  const fillPct = criticalCount > 0 ? (count / criticalCount) * 100 : 0;

  return (
    <div className="rounded-lg border p-5 h-full flex flex-col gap-4">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Top Critical Pattern
      </p>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-snug text-foreground">
            {help}
          </p>
          <p className="mt-1 text-base font-medium text-foreground">
            {pct}% of all critical issues
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-4xl font-bold tabular-nums leading-none text-foreground">
            {count}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {count === 1 ? "instance" : "instances"}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {pageCount} {pageCount === 1 ? "page" : "pages"} &middot;{" "}
        {propertyCount} {propertyCount === 1 ? "property" : "properties"}
        {topPropertyName && (
          <>
            {" "}
            &middot; most in{" "}
            <span className="font-medium text-foreground">
              {topPropertyName}
            </span>
          </>
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {count} of {criticalCount} critical issues
        </p>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-foreground/50"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardTopCriticalPattern;
