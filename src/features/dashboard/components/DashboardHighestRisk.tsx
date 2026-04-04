"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { DashboardSummary } from "../types/dashboard";

const DISPLAY_LIMIT = 5;

interface DashboardHighestRiskProps {
  summary: DashboardSummary;
}

const DashboardHighestRisk = ({ summary }: DashboardHighestRiskProps) => {
  const { topCriticalPages } = summary;
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // Derive unique properties that have critical pages — selector options
  const propertiesWithCritical = Array.from(
    new Map(
      topCriticalPages
        .filter((p) => p.propertyId)
        .map((p) => [p.propertyId, p.propertyName]),
    ).entries(),
  );

  const showSelector = propertiesWithCritical.length > 1;

  // Filter by selected property then take top N — list is pre-sorted by criticalCount desc
  const visiblePages = (
    selectedPropertyId
      ? topCriticalPages.filter((p) => p.propertyId === selectedPropertyId)
      : topCriticalPages
  ).slice(0, DISPLAY_LIMIT);

  const totalCritical = visiblePages.reduce((sum, p) => sum + p.criticalCount, 0);

  if (topCriticalPages.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No critical unfixed issues found.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Control row: tally on left, property filter on right */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-severity-critical">
            {totalCritical} critical
          </span>{" "}
          across {visiblePages.length}{" "}
          {visiblePages.length === 1 ? "page" : "pages"}
        </p>

        {showSelector && (
          <div className="flex items-center gap-1.5 shrink-0">
            <label
              htmlFor="high-risk-property-filter"
              className="text-xs text-muted-foreground whitespace-nowrap"
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
        )}
      </div>

      {/* Ranked page list */}
      {visiblePages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No critical issues for this property.
        </p>
      ) : (
        <ol aria-label="Pages ranked by critical unfixed issue count">
          {visiblePages.map((page, idx) => (
            <li key={page.pageId}>
              <a
                href={`/issues?pageId=${page.pageId}`}
                className="group grid grid-cols-[1.25rem_1fr_5rem] items-center gap-x-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
              >
                {/* Rank */}
                <span
                  className="text-right text-xs font-bold tabular-nums text-muted-foreground/40 group-hover:text-muted-foreground/70"
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

                {/* Critical count + chevron */}
                <div className="flex items-center justify-end gap-1">
                  <span className="tabular-nums text-xs font-bold text-severity-critical whitespace-nowrap">
                    {page.criticalCount} critical
                  </span>
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground/20 group-hover:text-muted-foreground/50" />
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default DashboardHighestRisk;
