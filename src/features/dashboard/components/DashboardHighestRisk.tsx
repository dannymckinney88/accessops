"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

const DISPLAY_LIMIT = 5;

// Shared grid layout: rank | content | metric | chevron
const ROW_GRID =
  "grid grid-cols-[1.5rem_1fr_4rem_1rem] items-center gap-x-2 px-2";

interface DashboardHighestRiskProps {
  summary: DashboardSummary;
}

const DashboardHighestRisk = ({ summary }: DashboardHighestRiskProps) => {
  const { topCriticalPages } = summary;
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const propertiesWithCritical = Array.from(
    new Map(
      topCriticalPages
        .filter((p) => p.propertyId)
        .map((p) => [p.propertyId, p.propertyName]),
    ).entries(),
  );

  const showSelector = propertiesWithCritical.length > 1;

  const visiblePages = (
    selectedPropertyId
      ? topCriticalPages.filter((p) => p.propertyId === selectedPropertyId)
      : topCriticalPages
  ).slice(0, DISPLAY_LIMIT);

  const totalCritical = visiblePages.reduce(
    (sum, p) => sum + p.criticalCount,
    0,
  );

  if (topCriticalPages.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No critical unfixed issues found.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Control row — same grid origin as list rows */}
      {showSelector && (
        <div className={ROW_GRID}>
          <span aria-hidden="true" />
          <div className="col-span-3 flex items-center gap-1.5">
            <label
              htmlFor="high-risk-property-filter"
              className="text-xs text-muted-foreground shrink-0"
            >
              Property
            </label>
            <select
              id="high-risk-property-filter"
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value || null)}
              className="rounded border border-input bg-background px-1.5 py-0.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All</option>
              {propertiesWithCritical.map(([propertyId, propertyName]) => (
                <option key={propertyId} value={propertyId}>
                  {propertyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {visiblePages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No critical issues for this property.
        </p>
      ) : (
        <div>
          {/* Ranked list */}
          <ol aria-label="Pages ranked by critical unfixed issue count">
            {visiblePages.map((page, idx) => (
              <li key={page.pageId}>
                <a
                  href={`/issues?pageId=${page.pageId}`}
                  className={`group ${ROW_GRID} rounded-md py-2 transition-colors hover:bg-muted/50`}
                >
                  {/* Rank */}
                  <span
                    className="text-right text-xs font-medium tabular-nums text-muted-foreground/40 group-hover:text-muted-foreground/70"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>

                  {/* Title + metadata */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                      {page.pageTitle}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground/60 truncate">
                      {selectedPropertyId === null
                        ? `${page.propertyName}${page.pagePath ? ` · ${page.pagePath}` : ""}`
                        : page.pagePath}
                    </span>
                  </div>

                  {/* Critical count — dedicated column, no chevron competing */}
                  <span className="text-right text-xs font-bold tabular-nums text-severity-critical whitespace-nowrap">
                    {page.criticalCount} critical
                  </span>

                  {/* Chevron — own column */}
                  <ChevronRight className="size-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 justify-self-end" />
                </a>
              </li>
            ))}
          </ol>

          {/* Summary row — same grid, metric column aligns with list counts */}
          <div
            className={`${ROW_GRID} pt-2 mt-1 border-t border-border/40`}
            aria-label={`Top ${visiblePages.length} areas, ${totalCritical} critical total`}
          >
            <span aria-hidden="true" />
            <span className="text-[10px] text-muted-foreground/50">
              Top {visiblePages.length} areas
            </span>
            <span className="text-right text-xs font-bold tabular-nums text-severity-critical/70 whitespace-nowrap">
              {totalCritical} critical
            </span>
            <span aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHighestRisk;
