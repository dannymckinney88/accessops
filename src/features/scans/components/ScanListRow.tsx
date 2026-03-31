"use client";

import { useState, useRef, useId } from "react";
import { ChevronRight, ChevronDown, AlertTriangle } from "lucide-react";
import type { ScanPageRowData, ScanRowData } from "@/lib/data";
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

const progressBarColor = (pct: number): string => {
  if (pct === 100) return "bg-status-verified";
  if (pct >= 50) return "bg-primary";
  if (pct > 0) return "bg-severity-serious";
  return "bg-muted-foreground/25";
};

const ScanListRow = ({ row }: ScanListRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref to the native <button> — used to restore focus after Escape from
  // within the expanded region (future-proof for interactive page rows).
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Stable IDs for aria-controls / region id — unique per row instance.
  const regionId = useId();

  const toggle = () => setIsExpanded((prev) => !prev);

  // Escape on the trigger button closes the row.
  // Enter / Space are handled natively by the <button> element.
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && isExpanded) {
      e.preventDefault();
      setIsExpanded(false);
      // Focus stays on the trigger — we are already here.
    }
  };

  // Escape from anywhere within the expanded region closes the row and
  // explicitly returns focus to the trigger.
  // requestAnimationFrame defers focus until after React has flushed the
  // state update and unmounted the region.
  const handleRegionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      setIsExpanded(false);
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const resolvedPct =
    row.totalIssues > 0
      ? Math.round((row.resolvedIssues / row.totalIssues) * 100)
      : 0;

  const scanDate = formatDate(row.scanRun.initiatedAt);

  // Human-readable severity description for screen readers.
  const severityParts = [
    row.severitySummary.critical > 0 &&
      `${row.severitySummary.critical} critical`,
    row.severitySummary.serious > 0 && `${row.severitySummary.serious} serious`,
    row.severitySummary.moderate > 0 &&
      `${row.severitySummary.moderate} moderate`,
    row.severitySummary.minor > 0 && `${row.severitySummary.minor} minor`,
  ].filter(Boolean) as string[];

  const severityLabel =
    severityParts.length > 0
      ? severityParts.join(", ") + " remaining"
      : "No remaining issues";

  // Remaining count emphasis: critical rows read more urgent.
  const remainingClass =
    row.remainingIssues === 0
      ? "text-muted-foreground"
      : row.isHighRisk
        ? "font-semibold text-severity-critical"
        : "font-medium text-foreground";

  return (
    <div role="listitem" className="border-b last:border-0">
      {/* ── Collapsed row — native <button> for keyboard + ARIA semantics ── */}
      {/*
        Using a native <button> here (not div[role="button"]) because:
        - Enter / Space activation are handled natively — no custom keydown needed
        - Focus is part of the normal tab order without tabIndex hacks
        - aria-expanded on a native button is well-supported across all AT
        - No risk of accidentally nesting interactive elements (caught at parse time)
      */}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls={regionId}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className={[
          "flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left",
          "transition-colors duration-100",
          "hover:bg-accent/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          isExpanded ? "bg-card" : "bg-background",
        ].join(" ")}
      >
        {/* Expand/collapse chevron — purely visual, aria-hidden */}
        <span
          className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </span>

        {/* ── Date + scan type badge ─────────────────────────────────── */}
        <div className="w-[118px] shrink-0">
          <p className="text-sm leading-tight text-foreground">{scanDate}</p>
          <span
            className={`text-xs font-medium leading-tight ${
              row.scanType === "Baseline"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            {row.scanType}
          </span>
        </div>

        {/* ── Property name + page count ──────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {row.property.name}
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            {row.pages.length} {row.pages.length === 1 ? "page" : "pages"}
          </p>
        </div>

        {/* ── Severity summary ────────────────────────────────────────── */}
        {/*
          Visual badges are aria-hidden; a sr-only span carries the full
          description so screen readers hear "5 critical, 2 serious remaining"
          not abbreviations like "5 crit".
        */}
        <div
          className="hidden w-36 shrink-0 items-center gap-2.5 md:flex"
          aria-hidden="true"
        >
          {row.severitySummary.critical > 0 && (
            <span className="tabular-nums text-xs font-medium text-severity-critical">
              {row.severitySummary.critical} crit
            </span>
          )}
          {row.severitySummary.serious > 0 && (
            <span className="tabular-nums text-xs font-medium text-severity-serious">
              {row.severitySummary.serious} ser
            </span>
          )}
          {row.severitySummary.moderate > 0 && (
            <span className="tabular-nums text-xs font-medium text-severity-moderate">
              {row.severitySummary.moderate} mod
            </span>
          )}
        </div>
        {/* Screen reader equivalent for severity */}
        <span className="sr-only">{severityLabel}.</span>

        {/* ── Progress summary + bar ──────────────────────────────────── */}
        {/*
          Visual section is aria-hidden; sr-only span carries the meaningful
          sentence. The progress bar is presentational — totals in the text
          are the accessible source of truth.
        */}
        <div
          className="hidden w-[268px] shrink-0 items-center gap-3 lg:flex"
          aria-hidden="true"
        >
          <div className="flex flex-1 items-center gap-1.5 text-xs">
            <span className="tabular-nums text-muted-foreground">
              {row.totalIssues}
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className="tabular-nums text-muted-foreground">
              {row.resolvedIssues} resolved
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className={`tabular-nums ${remainingClass}`}>
              {row.remainingIssues} remaining
            </span>
          </div>

          {row.totalIssues > 0 && (
            <div
              role="presentation"
              className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${progressBarColor(resolvedPct)}`}
                style={{ width: `${resolvedPct}%` }}
              />
            </div>
          )}
        </div>
        {/* Screen reader equivalent for progress */}
        <span className="sr-only">
          {row.totalIssues} total, {row.resolvedIssues} resolved,{" "}
          {row.remainingIssues} remaining.
        </span>

        {/* ── Risk indicator ───────────────────────────────────────────── */}
        {/*
          Purely visual signal — the remaining count above already communicates
          urgency to screen readers. Icon is aria-hidden.
        */}
        <div className="flex w-5 shrink-0 justify-center" aria-hidden="true">
          {row.isHighRisk && (
            <AlertTriangle className="size-3.5 text-severity-critical" />
          )}
        </div>
      </button>

      {/* ── Expanded region ──────────────────────────────────────────────── */}
      {/*
        role="region" gives screen readers a named landmark to navigate to.
        aria-label spells out what this section contains and which scan it
        belongs to — important context when navigating by landmark.
        onKeyDown propagates Escape upward from any interactive child (future
        page row actions) back to the parent, closing the region and restoring
        focus to the trigger button.
      */}
      {isExpanded && (
        <div
          id={regionId}
          role="region"
          aria-label={`${row.pages.length} ${row.pages.length === 1 ? "page" : "pages"} from ${row.property.name} ${row.scanType.toLowerCase()} scan, ${scanDate}`}
          onKeyDown={handleRegionKeyDown}
          className="border-t border-border/40 bg-surface-raised"
        >
          {row.pages.length > 0 ? (
            row.pages.map((pageRow: ScanPageRowData) => (
              <ScanPageRow key={pageRow.page.id} data={pageRow} />
            ))
          ) : (
            <p className="py-3 pl-10 text-sm text-muted-foreground">
              No page data recorded for this scan.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanListRow;
