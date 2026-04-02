"use client";

import type { IssueFilters, QuickFilterChip } from "../hooks/useIssueFilters";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";
import IssueQuickFilters from "./IssueQuickFilters";

export type IssueViewMode = "flat" | "grouped-page" | "grouped-rule";

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
  groupedCount?: number;
  hasActiveFilters: boolean;
  activeSearch: string;
  viewMode: IssueViewMode;
  onToggleSeverity: (s: Severity) => void;
  onSetPropertyId: (id: string | null) => void;
  onSetPageId: (id: string | null) => void;
  onSetRuleId: (id: string | null) => void;
  onSetStatus: (id: RemediationStatus | null) => void;
  onSetSearch: (q: string) => void;
  onSetQuickFilter: (chip: QuickFilterChip | null) => void;
  onSetAll: () => void;
  onReset: () => void;
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
  groupedCount,
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
}: IssueFilterBarProps) => {
  const activeFilterLabels: string[] = [];

  if (filters.quickFilter)
    activeFilterLabels.push(quickFilterLabel[filters.quickFilter]);
  filters.severity.forEach((severity) =>
    activeFilterLabels.push(severityLabel[severity]),
  );
  filters.status.forEach((status) =>
    activeFilterLabels.push(statusLabel[status]),
  );

  if (filters.propertyId) {
    const property = properties.find((item) => item.id === filters.propertyId);
    if (property) activeFilterLabels.push(property.name);
  }

  if (filters.pageId) {
    const page = availablePages.find((item) => item.id === filters.pageId);
    if (page) activeFilterLabels.push(page.title);
  }

  if (filters.ruleId && ruleLabel) activeFilterLabels.push(ruleLabel);
  if (activeSearch) activeFilterLabels.push(`"${activeSearch}"`);

  const visiblePages = filters.propertyId
    ? availablePages.filter((page) => page.propertyId === filters.propertyId)
    : availablePages;

  const pagesByProperty = filters.propertyId
    ? null
    : visiblePages.reduce<
        Record<string, { propertyName: string; pages: AvailablePage[] }>
      >((acc, page) => {
        if (!acc[page.propertyId]) {
          acc[page.propertyId] = {
            propertyName: page.propertyName,
            pages: [],
          };
        }
        acc[page.propertyId].pages.push(page);
        return acc;
      }, {});

  const summaryText =
    viewMode === "grouped-rule" && groupedCount !== undefined
      ? `Showing ${groupedCount} grouped issues from ${filteredCount} issue instances`
      : viewMode === "grouped-page"
        ? `Showing ${filteredCount} issues grouped by page`
        : `Showing ${filteredCount} of ${totalCount} issues`;

  return (
    <div className="flex flex-col gap-2">

      {/* Unified filter row: quick chips + search + dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <IssueQuickFilters
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onToggleSeverity={onToggleSeverity}
          onSetQuickFilter={onSetQuickFilter}
          onSetAll={onSetAll}
          onReset={onReset}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="search"
            placeholder="Search issues…"
            value={filters.search}
            onChange={(e) => onSetSearch(e.target.value)}
            aria-label="Search issues"
            className={`${inputClass} w-48`}
          />

          <select
            value={filters.propertyId ?? ""}
            onChange={(e) => onSetPropertyId(e.target.value || null)}
            aria-label="Filter by property"
            className={`${inputClass} pr-2`}
          >
            <option value="">All properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
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
              ? Object.entries(pagesByProperty).map(([propertyId, group]) => (
                  <optgroup key={propertyId} label={group.propertyName}>
                    {group.pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </optgroup>
                ))
              : visiblePages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
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
            ).map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.ruleId ?? ""}
            onChange={(e) => onSetRuleId(e.target.value || null)}
            aria-label="Filter by rule"
            className={`${inputClass} max-w-55 pr-2`}
          >
            <option value="">All rules</option>
            {availableRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Clear all filters"
              className="h-8 rounded-md border border-transparent px-3 text-xs text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {(hasActiveFilters || viewMode !== "flat") && (
        <p role="status" className="text-xs text-muted-foreground">
          {summaryText}
          {activeFilterLabels.length > 0 && (
            <> &middot; Filtered by: {activeFilterLabels.join(", ")}</>
          )}
        </p>
      )}
    </div>
  );
};

export default IssueFilterBar;
