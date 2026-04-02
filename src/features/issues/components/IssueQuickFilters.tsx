"use client";

import type { IssueFilters, QuickFilterChip } from "../hooks/useIssueFilters";
import type { Severity } from "@/lib/data/types/domain";

interface IssueQuickFiltersProps {
  filters: IssueFilters;
  hasActiveFilters: boolean;
  onToggleSeverity: (s: Severity) => void;
  onSetQuickFilter: (chip: QuickFilterChip | null) => void;
  onSetAll: () => void;
  onReset: () => void;
}

const baseClass =
  "inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

const inactiveClass =
  "border-border bg-background text-foreground/80 hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground active:border-interactive-border-active active:bg-interactive-active active:text-interactive-active-foreground";

const activeClass =
  "border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground hover:border-interactive-selected-border hover:bg-interactive-selected hover:text-interactive-selected-foreground active:border-interactive-selected-border active:bg-interactive-selected active:text-interactive-selected-foreground";

const criticalActiveClass =
  "border-interactive-critical-selected-border bg-interactive-critical-selected text-interactive-critical-selected-foreground hover:border-interactive-critical-selected-border hover:bg-interactive-critical-selected hover:text-interactive-critical-selected-foreground active:border-interactive-critical-selected-border active:bg-interactive-critical-selected active:text-interactive-critical-selected-foreground";

const IssueQuickFilters = ({
  filters,
  onToggleSeverity,
  onSetQuickFilter,
  onSetAll,
}: IssueQuickFiltersProps) => {
  const allActive =
    filters.quickFilter === null &&
    filters.severity.length === 0 &&
    filters.status.length === 0 &&
    filters.propertyId === null;

  const criticalActive = filters.severity.includes("critical");
  const myIssuesActive = filters.quickFilter === "my-issues";
  const unfixedActive = filters.quickFilter === "unfixed";
  const needsAttentionActive = filters.quickFilter === "needs-attention";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Quick filters"
    >
      <button
        type="button"
        onClick={onSetAll}
        aria-pressed={allActive}
        className={`${baseClass} ${allActive ? activeClass : inactiveClass}`}
      >
        All
      </button>

      <button
        type="button"
        onClick={() => onSetQuickFilter("my-issues")}
        aria-pressed={myIssuesActive}
        className={`${baseClass} ${myIssuesActive ? activeClass : inactiveClass}`}
      >
        My Issues
      </button>

      <button
        type="button"
        onClick={() => onToggleSeverity("critical")}
        aria-pressed={criticalActive}
        className={`${baseClass} ${criticalActive ? criticalActiveClass : inactiveClass}`}
      >
        Critical
      </button>

      <button
        type="button"
        onClick={() => onSetQuickFilter("unfixed")}
        aria-pressed={unfixedActive}
        className={`${baseClass} ${unfixedActive ? activeClass : inactiveClass}`}
      >
        Unfixed
      </button>

      <button
        type="button"
        onClick={() => onSetQuickFilter("needs-attention")}
        aria-pressed={needsAttentionActive}
        className={`${baseClass} ${needsAttentionActive ? activeClass : inactiveClass}`}
      >
        Needs Attention
      </button>
    </div>
  );
};

export default IssueQuickFilters;
