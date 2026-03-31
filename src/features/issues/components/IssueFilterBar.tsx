"use client";

import type { IssueFilters, QuickFilterChip } from "../hooks/useIssueFilters";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";
import IssueQuickFilters from "./IssueQuickFilters";

interface IssueFilterBarProps {
  filters: IssueFilters;
  properties: Property[];
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  activeSearch: string;
  onToggleSeverity: (s: Severity) => void;
  onSetPropertyId: (id: string | null) => void;
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
  totalCount,
  filteredCount,
  hasActiveFilters,
  activeSearch,
  onToggleSeverity,
  onSetPropertyId,
  onSetSearch,
  onSetQuickFilter,
  onSetAll,
  onReset,
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
  if (activeSearch) activeFilterLabels.push(`"${activeSearch}"`);

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
