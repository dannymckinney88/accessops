"use client";

import type { IssueFilters, QuickFilterChip } from "../hooks/useIssueFilters";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";
import IssueQuickFilters from "./IssueQuickFilters";

export type AvailablePage = {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
};

export type AvailableRule = {
  id: string;
  label: string;
};

interface IssueFilterBarProps {
  filters: IssueFilters;
  properties: Property[];
  availablePages: AvailablePage[];
  availableRules: AvailableRule[];
  ruleLabel: string | null;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  activeSearch: string;
  viewMode: "flat" | "grouped";
  onToggleSeverity: (s: Severity) => void;
  onSetPropertyId: (id: string | null) => void;
  onSetPageId: (id: string | null) => void;
  onSetRuleId: (id: string | null) => void;
  onSetStatus: (id: RemediationStatus | null) => void;
  onSetSearch: (q: string) => void;
  onSetQuickFilter: (chip: QuickFilterChip | null) => void;
  onSetAll: () => void;
  onReset: () => void;
  onSetViewMode: (mode: "flat" | "grouped") => void;
}

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

const statusLabel: Record<RemediationStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  fixed: "Fixed",
  verified: "Verified",
  "accepted-risk": "Accepted Risk",
};

const quickFilterLabel: Record<QuickFilterChip, string> = {
  "my-issues": "My Issues",
  unfixed: "Unfixed",
  "needs-attention": "Needs Attention",
};

const inputClass =
  "h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const IssueFilterBar = ({
  filters,
  properties,
  availablePages,
  availableRules,
  ruleLabel,
  totalCount,
  filteredCount,
  hasActiveFilters,
  activeSearch,
  viewMode,
  onToggleSeverity,
  onSetPropertyId,
  onSetPageId,
  onSetRuleId,
  onSetStatus,
  onSetSearch,
  onSetQuickFilter,
  onSetAll,
  onReset,
  onSetViewMode,
}: IssueFilterBarProps) => {
  // Build human-readable labels for the active filter summary.
  const activeFilterLabels: string[] = [];
  if (filters.quickFilter)
    activeFilterLabels.push(quickFilterLabel[filters.quickFilter]);
  filters.severity.forEach((s) => activeFilterLabels.push(severityLabel[s]));
  filters.status.forEach((s) => activeFilterLabels.push(statusLabel[s]));
  if (filters.propertyId) {
    const prop = properties.find((p) => p.id === filters.propertyId);
    if (prop) activeFilterLabels.push(prop.name);
  }
  if (filters.pageId) {
    const page = availablePages.find((p) => p.id === filters.pageId);
    if (page) activeFilterLabels.push(page.title);
  }
  if (filters.ruleId && ruleLabel) activeFilterLabels.push(ruleLabel);
  if (activeSearch) activeFilterLabels.push(`"${activeSearch}"`);

  // Pages to show in the page dropdown.
  // When a property is active, restrict to that property's pages.
  const visiblePages = filters.propertyId
    ? availablePages.filter((p) => p.propertyId === filters.propertyId)
    : availablePages;

  // Group pages by property for the optgroup display when no property filter is active.
  const pagesByProperty = filters.propertyId
    ? null
    : visiblePages.reduce<Record<string, { propertyName: string; pages: AvailablePage[] }>>(
        (acc, p) => {
          if (!acc[p.propertyId]) {
            acc[p.propertyId] = { propertyName: p.propertyName, pages: [] };
          }
          acc[p.propertyId].pages.push(p);
          return acc;
        },
        {},
      );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <IssueQuickFilters
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onToggleSeverity={onToggleSeverity}
          onSetQuickFilter={onSetQuickFilter}
          onSetAll={onSetAll}
          onReset={onReset}
        />

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input
            type="search"
            placeholder="Search issues…"
            value={filters.search}
            onChange={(e) => onSetSearch(e.target.value)}
            aria-label="Search issues"
            className={`${inputClass} w-52`}
          />

          <select
            value={filters.propertyId ?? ""}
            onChange={(e) => onSetPropertyId(e.target.value || null)}
            aria-label="Filter by property"
            className={`${inputClass} pr-2`}
          >
            <option value="">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.pageId ?? ""}
            onChange={(e) => onSetPageId(e.target.value || null)}
            aria-label="Filter by page"
            className={`${inputClass} pr-2`}
          >
            <option value="">All pages</option>
            {pagesByProperty
              ? Object.entries(pagesByProperty).map(([propId, group]) => (
                  <optgroup key={propId} label={group.propertyName}>
                    {group.pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </optgroup>
                ))
              : visiblePages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
          </select>

          <select
            value={filters.status[0] ?? ""}
            onChange={(e) =>
              onSetStatus((e.target.value as RemediationStatus) || null)
            }
            aria-label="Filter by status"
            className={`${inputClass} pr-2`}
          >
            <option value="">All statuses</option>
            {(
              [
                "open",
                "in-progress",
                "fixed",
                "verified",
                "accepted-risk",
              ] as RemediationStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>

          <select
            value={filters.ruleId ?? ""}
            onChange={(e) => onSetRuleId(e.target.value || null)}
            aria-label="Filter by rule"
            className={`${inputClass} pr-2 max-w-[220px]`}
          >
            <option value="">All rules</option>
            {availableRules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Clear all filters"
              className="h-8 rounded-md border border-transparent px-3 text-xs text-muted-foreground outline-none hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              Clear all filters
            </button>
          )}

          <div
            role="group"
            aria-label="View mode"
            className="flex items-center rounded-md border border-input overflow-hidden shrink-0"
          >
            <button
              type="button"
              onClick={() => onSetViewMode("flat")}
              aria-pressed={viewMode === "flat"}
              className={`h-8 px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                viewMode === "flat"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Flat
            </button>
            <button
              type="button"
              onClick={() => onSetViewMode("grouped")}
              aria-pressed={viewMode === "grouped"}
              className={`h-8 px-3 text-xs font-medium border-l border-input transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                viewMode === "grouped"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Group by Page
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <p role="status" className="text-xs text-muted-foreground">
          Showing {filteredCount} of {totalCount} issues
          {activeFilterLabels.length > 0 && (
            <> &middot; Filtered by: {activeFilterLabels.join(", ")}</>
          )}
        </p>
      )}
    </div>
  );
};

export default IssueFilterBar;
