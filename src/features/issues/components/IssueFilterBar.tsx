"use client";

import type { IssueFilters } from "../hooks/useIssueFilters";
import { defaultIssueFilters } from "../hooks/useIssueFilters";
import type { Severity, RemediationStatus, User } from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";

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
  assignableUsers: User[];
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
  onSetAssigneeId: (id: string | null) => void;
  onSetSearch: (q: string) => void;
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

const selectClass =
  "h-8 rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

const IssueFilterBar = ({
  filters,
  properties,
  assignableUsers,
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
  onSetAssigneeId,
  onSetSearch,
  onReset,
}: IssueFilterBarProps) => {
  const activeFilterLabels: string[] = [];

  filters.severity.forEach((severity) =>
    activeFilterLabels.push(severityLabel[severity]),
  );

  // Only surface status labels when the user has deviated from the default unfixed view.
  const defaultStatusKey = defaultIssueFilters.status.join(",");
  if (filters.status.join(",") !== defaultStatusKey) {
    filters.status.forEach((status) => activeFilterLabels.push(statusLabel[status]));
  }

  if (filters.propertyIds[0]) {
    const property = properties.find((item) => item.id === filters.propertyIds[0]);
    if (property) activeFilterLabels.push(property.name);
  }

  if (filters.pageIds[0]) {
    const page = availablePages.find((item) => item.id === filters.pageIds[0]);
    if (page) activeFilterLabels.push(page.title);
  }

  if (filters.ruleIds[0] && ruleLabel) activeFilterLabels.push(ruleLabel);
  if (filters.assigneeIds[0]) {
    if (filters.assigneeIds[0] === "unassigned") {
      activeFilterLabels.push("Unassigned");
    } else {
      const user = assignableUsers.find((u) => u.id === filters.assigneeIds[0]);
      if (user) activeFilterLabels.push(user.name);
    }
  }
  if (activeSearch) activeFilterLabels.push(`"${activeSearch}"`);

  const activePropertyId = filters.propertyIds[0] ?? null;

  const visiblePages = activePropertyId
    ? availablePages.filter((page) => page.propertyId === activePropertyId)
    : availablePages;

  const pagesByProperty = activePropertyId
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
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          type="search"
          placeholder="Search issues…"
          value={filters.search}
          onChange={(e) => onSetSearch(e.target.value)}
          aria-label="Search issues"
          className={selectClass}
        />

        <select
          value={filters.propertyIds[0] ?? ""}
          onChange={(e) => onSetPropertyId(e.target.value || null)}
          aria-label="Filter by property"
          className={`${selectClass} pr-2`}
        >
          <option value="">All properties</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>

        <select
          value={filters.pageIds[0] ?? ""}
          onChange={(e) => onSetPageId(e.target.value || null)}
          aria-label="Filter by page"
          className={selectClass}
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
          className={selectClass}
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
          value={filters.ruleIds[0] ?? ""}
          onChange={(e) => onSetRuleId(e.target.value || null)}
          aria-label="Filter by rule"
          className={`${selectClass} max-w-55`}
        >
          <option value="">All rules</option>
          {availableRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.label}
            </option>
          ))}
        </select>

        <select
          value={filters.assigneeIds[0] ?? ""}
          onChange={(e) => onSetAssigneeId(e.target.value || null)}
          aria-label="Filter by assignee"
          className={`${selectClass} pr-2`}
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {assignableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Clear all filters"
            className="h-8 rounded-md border border-transparent px-3 text-xs text-muted-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground active:border-interactive-border-active active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          >
            Clear
          </button>
        )}
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
