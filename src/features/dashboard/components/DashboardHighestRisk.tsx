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

  if (topCriticalPages.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No critical unfixed issues found.
      </p>
    );
  }

  return (
    <div className="mt-4">
      {/* Property selector — only shown when multiple properties have critical issues */}
      {showSelector && (
        <div
          role="group"
          aria-label="Filter high-risk areas by property"
          className="flex flex-wrap gap-1 mb-3"
        >
          <button
            type="button"
            onClick={() => setSelectedPropertyId(null)}
            aria-pressed={selectedPropertyId === null}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selectedPropertyId === null
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {propertiesWithCritical.map(([propertyId, propertyName]) => (
            <button
              key={propertyId}
              type="button"
              onClick={() => setSelectedPropertyId(propertyId)}
              aria-pressed={selectedPropertyId === propertyId}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selectedPropertyId === propertyId
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {propertyName}
            </button>
          ))}
        </div>
      )}

      {visiblePages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No critical issues for this property.
        </p>
      ) : (
        <ol
          className="flex flex-col gap-px"
          aria-label="Pages ranked by critical unfixed issue count"
        >
          {visiblePages.map((page, idx) => (
            <li key={page.pageId}>
              <a
                href={`/issues?pageId=${page.pageId}`}
                className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
              >
                {/* Rank */}
                <span
                  className="shrink-0 w-5 text-right text-xs font-bold tabular-nums text-muted-foreground/50 group-hover:text-muted-foreground/80"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>

                {/* Page info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                    {page.pageTitle}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 truncate font-mono">
                    {selectedPropertyId === null
                      ? `${page.propertyName}${page.pagePath ? ` · ${page.pagePath}` : ""}`
                      : page.pagePath}
                  </span>
                </div>

                {/* Critical count + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tabular-nums text-xs font-bold text-severity-critical">
                    {page.criticalCount} critical
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground/20 group-hover:text-muted-foreground/50" />
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
