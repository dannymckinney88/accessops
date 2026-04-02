import { AlertTriangle, ChevronRight } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

interface DashboardHighestRiskProps {
  summary: DashboardSummary;
}

const DashboardHighestRisk = ({ summary }: DashboardHighestRiskProps) => {
  const { topCriticalPages } = summary;

  const groupedByProperty = topCriticalPages.reduce(
    (acc, page) => {
      if (!acc[page.propertyName]) acc[page.propertyName] = [];
      acc[page.propertyName].push(page);
      return acc;
    },
    {} as Record<string, typeof topCriticalPages>,
  );

  return (
    <div className="mt-6 flex flex-col gap-10 pb-2">
      {Object.entries(groupedByProperty).map(([propertyName, pages]) => (
        <section key={propertyName} className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 px-1">
            <AlertTriangle className="size-3.5 text-severity-critical" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {propertyName}
            </h3>
          </div>

          <ul className="flex flex-col gap-px" role="list">
            {pages.map((page) => (
              <li key={page.pageId}>
                <a
                  href={`/issues?pageId=${page.pageId}`}
                  className="group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {page.pageTitle}
                    </span>
                    <span className="truncate text-[10px] font-mono text-muted-foreground/80">
                      {page.pagePath}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="tabular-nums text-xs font-bold text-severity-critical">
                      {page.criticalCount} critical
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground/10 group-hover:text-muted-foreground/40" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default DashboardHighestRisk;
