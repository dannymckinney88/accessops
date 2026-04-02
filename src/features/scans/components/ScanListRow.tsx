"use client";

import { useId, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type { ScanRowData } from "@/lib/data";
import ScanPageRow from "./ScanPageRow";

interface ScanListRowProps {
  row: ScanRowData;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const ScanListRow = ({ row }: ScanListRowProps) => {
  const isCurrentScan = row.scanType === "Current audit";
  const [isExpanded, setIsExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const regionId = useId();

  const scanDate = formatDate(row.scanRun.initiatedAt);

  const historicalClosureLabel =
    row.remainingIssues === 0
      ? "Clean at close"
      : `Closed with ${row.remainingIssues} remaining`;

  const currentSummary = `${row.remainingIssues} remaining${
    row.severitySummary.critical > 0
      ? ` · ${row.severitySummary.critical} critical`
      : ""
  } · ${row.pages.length} ${row.pages.length === 1 ? "page" : "pages"}`;

  const historicalSummary = `${row.totalIssues} issues · ${row.resolvedIssues} resolved · ${row.remainingIssues} remaining`;

  const toggleExpanded = () => {
    if (!isCurrentScan) return;
    setIsExpanded((prev) => !prev);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "Escape" && isExpanded) {
      event.preventDefault();
      setIsExpanded(false);
    }
  };

  const handleRegionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsExpanded(false);

      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  if (!isCurrentScan) {
    return (
      <div
        role="listitem"
        className="border-b bg-background px-4 py-3.5 last:border-0"
        aria-label={`${row.property.name} previous audit from ${scanDate}. ${historicalSummary}. ${historicalClosureLabel}.`}
      >
        <div className="flex items-start gap-3">
          <div className="w-29.5 shrink-0">
            <p className="text-sm leading-tight text-foreground">{scanDate}</p>
            <span className="text-xs font-medium leading-tight text-muted-foreground">
              Previous audit
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {row.property.name}
            </p>
            <p className="mt-1 text-xs leading-tight text-muted-foreground">
              {historicalSummary}
            </p>
          </div>

          <div className="hidden w-40 shrink-0 text-right md:block">
            <p
              className={`text-xs font-medium ${
                row.remainingIssues === 0
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {historicalClosureLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="listitem" className="border-b last:border-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls={regionId}
        onClick={toggleExpanded}
        onKeyDown={handleTriggerKeyDown}
        className={[
          "flex w-full items-start gap-3 px-4 py-3.5 text-left",
          "transition-colors duration-100",
          "hover:bg-accent/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          isExpanded ? "bg-card" : "bg-background",
        ].join(" ")}
      >
        <span
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </span>

        <div className="w-29.5 shrink-0">
          <p className="text-sm leading-tight text-foreground">{scanDate}</p>
          <span className="text-xs font-medium leading-tight text-primary">
            Current audit
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                {row.property.name}
              </p>
              <p className="mt-1 text-xs leading-tight text-muted-foreground">
                {currentSummary}
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-1 text-xs font-medium text-foreground lg:flex">
              <span>Browse pages</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="tabular-nums text-muted-foreground">
              {row.totalIssues} total
            </span>
            <span className="tabular-nums text-muted-foreground">
              {row.resolvedIssues} resolved
            </span>
            <span
              className={`tabular-nums ${
                row.remainingIssues > 0
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {row.remainingIssues} remaining
            </span>

            {row.severitySummary.critical > 0 && (
              <span className="flex items-center gap-1 font-medium text-severity-critical">
                <AlertTriangle className="size-3" aria-hidden="true" />
                <span className="tabular-nums">
                  {row.severitySummary.critical} critical
                </span>
              </span>
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div
          id={regionId}
          role="region"
          aria-label={`${row.property.name} current audit pages`}
          onKeyDown={handleRegionKeyDown}
          className="bg-surface-raised"
        >
          <div className="flex items-center justify-between gap-4 border-t border-border/40 px-5 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Pages in current audit
            </p>

            <Link
              href={`/issues?propertyId=${encodeURIComponent(row.property.id)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>View all issues</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {row.pages.length > 0 ? (
            <ul aria-label={`${row.property.name} scanned pages`}>
              {row.pages.map((pageRow) => (
                <ScanPageRow
                  key={pageRow.page.id}
                  data={pageRow}
                  propertyId={row.property.id}
                />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-3 text-sm text-muted-foreground">
              No page data recorded for this scan.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanListRow;
