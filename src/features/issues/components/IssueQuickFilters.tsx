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

const activeClass =
  "bg-foreground text-background border-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring";
// Critical chip gets severity-matched styling when active so the filter
// visually echoes what it represents. Kept restrained — only fires when active.
const criticalActiveClass =
  "bg-severity-critical text-background border-severity-critical focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring";
const inactiveClass =
  "bg-background text-foreground/80 border-border hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring";
const baseClass =
  "inline-flex items-center  rounded-md border px-3 py-1 text-xs font-medium transition-colors outline-none";

const IssueQuickFilters = ({
  filters,
  onToggleSeverity,
  onSetQuickFilter,
  onSetAll,
}: IssueQuickFiltersProps) => {
  // "All" is active when no quick filter chip is set and no other filters narrow the view.
  // It cannot use !hasActiveFilters because the default state is "unfixed", not "all".
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
      className="flex items-center gap-2 flex-wrap"
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
