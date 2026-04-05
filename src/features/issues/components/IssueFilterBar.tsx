"use client";

import type { IssueFilters } from "../hooks/useIssueFilters";
import type {
  Severity,
  RemediationStatus,
  User,
} from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";
import type { FilterOption } from "./filters/FilterMultiSelect";
import { FilterMultiSelect } from "./filters/FilterMultiSelect";

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
  hasActiveFilters: boolean;
  onToggleSeverity: (s: Severity) => void;
  onToggleStatus: (s: RemediationStatus) => void;
  onTogglePropertyId: (id: string) => void;
  onTogglePageId: (id: string) => void;
  onToggleRuleId: (id: string) => void;
  onToggleAssigneeId: (id: string) => void;
  onSetSearch: (q: string) => void;
  onClearSeverity: () => void;
  onClearStatus: () => void;
  onClearPropertyIds: () => void;
  onClearPageIds: () => void;
  onClearRuleIds: () => void;
  onClearAssigneeIds: () => void;
  onReset: () => void;
}

const severityOptions: FilterOption<Severity>[] = [
  { id: "critical", label: "Critical" },
  { id: "serious", label: "Serious" },
  { id: "moderate", label: "Moderate" },
  { id: "minor", label: "Minor" },
];

const statusOptions: FilterOption<RemediationStatus>[] = [
  { id: "open", label: "Open" },
  { id: "in-progress", label: "In Progress" },
  { id: "fixed", label: "Fixed" },
  { id: "verified", label: "Verified" },
  { id: "accepted-risk", label: "Accepted Risk" },
];

const IssueFilterBar = ({
  filters,
  properties,
  assignableUsers,
  availablePages,
  availableRules,
  hasActiveFilters,
  onToggleSeverity,
  onToggleStatus,
  onTogglePropertyId,
  onTogglePageId,
  onToggleRuleId,
  onToggleAssigneeId,
  onSetSearch,
  onClearSeverity,
  onClearStatus,
  onClearPropertyIds,
  onClearPageIds,
  onClearRuleIds,
  onClearAssigneeIds,
  onReset,
}: IssueFilterBarProps) => {
  const visiblePages =
    filters.propertyIds.length > 0
      ? availablePages.filter((page) =>
          filters.propertyIds.includes(page.propertyId),
        )
      : availablePages;

  const propertyOptions = properties.map((property) => ({
    id: property.id,
    label: property.name,
  }));

  const pageOptions = visiblePages.map((page) => ({
    id: page.id,
    label: page.title,
  }));

  const assigneeOptions: FilterOption[] = [
    { id: "unassigned", label: "Unassigned" },
    ...assignableUsers.map((user) => ({ id: user.id, label: user.name })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter issues"
      className="rounded-md border border-input bg-background p-3"
    >
      <div className="flex flex-wrap items-end gap-2">
        <FilterMultiSelect
          id="filter-severity"
          label="Severity"
          options={severityOptions}
          selectedIds={filters.severity}
          onToggle={onToggleSeverity}
          onClear={onClearSeverity}
          className="w-28"
        />

        <FilterMultiSelect
          id="filter-status"
          label="Status"
          options={statusOptions}
          selectedIds={filters.status}
          onToggle={onToggleStatus}
          onClear={onClearStatus}
          className="w-36"
        />

        <FilterMultiSelect
          id="filter-property"
          label="Property"
          options={propertyOptions}
          selectedIds={filters.propertyIds}
          onToggle={onTogglePropertyId}
          onClear={onClearPropertyIds}
          className="w-40"
        />

        <FilterMultiSelect
          id="filter-assignee"
          label="Assignee"
          options={assigneeOptions}
          selectedIds={filters.assigneeIds}
          onToggle={onToggleAssigneeId}
          onClear={onClearAssigneeIds}
          className="w-36"
        />

        <FilterMultiSelect
          id="filter-page"
          label="Page"
          options={pageOptions}
          selectedIds={filters.pageIds}
          onToggle={onTogglePageId}
          onClear={onClearPageIds}
          className="w-44"
        />

        <FilterMultiSelect
          id="filter-rule"
          label="Rule"
          options={availableRules}
          selectedIds={filters.ruleIds}
          onToggle={onToggleRuleId}
          onClear={onClearRuleIds}
          className="w-60"
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="issues-search"
            className="text-xs font-medium text-foreground/70"
          >
            Search
          </label>
          <input
            id="issues-search"
            type="search"
            placeholder="Rule, page, property…"
            value={filters.search}
            onChange={(event) => onSetSearch(event.target.value)}
            className="h-8 w-60 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          aria-label="Clear all filters"
          className="h-8 rounded-md border border-transparent px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground active:border-interactive-border-active active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default IssueFilterBar;
