"use client";

import { useEffect, useRef, useState } from "react";
import type { IssueFilters } from "../hooks/useIssueFilters";
import type {
  Severity,
  RemediationStatus,
  User,
} from "@/lib/data/types/domain";
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

// ---------------------------------------------------------------------------
// FilterMultiSelect — compact multi-select dropdown used for every filter
// dimension. Repeated 6 times in this feature, so the abstraction is justified.
// ---------------------------------------------------------------------------

type FilterOption<T extends string = string> = { id: T; label: string };

interface FilterMultiSelectProps<T extends string = string> {
  /** Unique ID used to construct stable HTML IDs for label/panel association. */
  id: string;
  label: string;
  options: FilterOption<T>[];
  selectedIds: T[];
  onToggle: (id: T) => void;
  /** Clears this dimension (sets it back to empty / no filter). */
  onClear: () => void;
  /** Width / flex classes applied to the outer container to control layout sizing. */
  className?: string;
}

const FilterMultiSelect = <T extends string>({
  id,
  label,
  options,
  selectedIds,
  onToggle,
  onClear,
  className,
}: FilterMultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const labelId = `${id}-label`;
  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;

  const selectedCount = selectedIds.length;
  // Show "All" when nothing is selected or everything is selected (same result).
  const isActive = selectedCount > 0 && selectedCount < options.length;
  const buttonLabel =
    selectedCount === 0 || selectedCount === options.length
      ? "All"
      : selectedCount === 1
        ? (options.find((o) => o.id === selectedIds[0])?.label ?? "1 selected")
        : `${selectedCount} selected`;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      e.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1 ${className ?? ""}`}
      onKeyDown={handleKeyDown}
    >
      <span id={labelId} className="text-xs font-medium text-foreground/70">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={panelId}
        aria-labelledby={`${labelId} ${triggerId}`}
        onClick={() => setIsOpen((o) => !o)}
        className={`inline-flex h-8 w-full items-center justify-between gap-1.5 rounded-md border px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 ${
          isActive
            ? "border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground"
            : "border-input bg-background text-foreground/80 hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground"
        }`}
      >
        <span className="truncate">{buttonLabel}</span>
        {/* chevron */}
        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 shrink-0 opacity-60"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="group"
          aria-labelledby={labelId}
          className="absolute top-full left-0 z-20 mt-1 max-h-60 min-w-44 overflow-y-auto rounded-md border border-input bg-background py-1 shadow-md"
        >
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-interactive-hover"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
                className="size-3.5 shrink-0"
              />
              <span>{opt.label}</span>
            </label>
          ))}
          {/* Show Clear whenever any value is selected, including "all selected" */}
          <div className="mx-2 my-1 border-t border-input" />
          <button
            type="button"
            onClick={onClear}
            disabled={selectedCount === 0}
            className="w-full px-2.5 py-1 text-left text-xs text-muted-foreground outline-none hover:bg-interactive-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// IssueFilterBar
// ---------------------------------------------------------------------------

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
  // When properties are selected, restrict page options to those properties.
  const visiblePages =
    filters.propertyIds.length > 0
      ? availablePages.filter((page) =>
          filters.propertyIds.includes(page.propertyId),
        )
      : availablePages;

  const propertyOptions = properties.map((p) => ({ id: p.id, label: p.name }));
  const pageOptions = visiblePages.map((p) => ({ id: p.id, label: p.title }));
  const assigneeOptions: FilterOption[] = [
    { id: "unassigned", label: "Unassigned" },
    ...assignableUsers.map((u) => ({ id: u.id, label: u.name })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter issues"
      className="rounded-md border border-input bg-background p-3"
    >
      {/*
        Single flat flex-wrap row. Controls pack into one line at desktop widths
        (~1130px+ content area) and wrap naturally at narrower viewports.
        Width ladder: compact (severity/status) → medium (property/assignee/page/rule) → compact (search).
        Clear all has no label so items-end aligns it to the input baseline automatically.
      */}
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
            onChange={(e) => onSetSearch(e.target.value)}
            className="h-8 w-60 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Always rendered so its position never jumps; disabled when nothing is active. */}
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
