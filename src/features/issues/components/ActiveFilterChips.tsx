"use client";

import type { IssueFilters } from "../hooks/useIssueFilters";
import type { Severity, RemediationStatus, User } from "@/lib/data/types/domain";
import type { Property } from "@/lib/data/index";
import type { AvailablePage, AvailableRule } from "./IssueFilterBar";

interface ActiveFilterChipsProps {
  filters: IssueFilters;
  hasActiveFilters: boolean;
  properties: Property[];
  assignableUsers: User[];
  availablePages: AvailablePage[];
  availableRules: AvailableRule[];
  onToggleSeverity: (s: Severity) => void;
  onToggleStatus: (s: RemediationStatus) => void;
  onTogglePropertyId: (id: string) => void;
  onTogglePageId: (id: string) => void;
  onToggleRuleId: (id: string) => void;
  onToggleAssigneeId: (id: string) => void;
  onClearPageIds: () => void;
  onClearRuleIds: () => void;
  onSetSearch: (q: string) => void;
}

const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

const statusLabels: Record<RemediationStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  fixed: "Fixed",
  verified: "Verified",
  "accepted-risk": "Accepted Risk",
};

type ChipDef = {
  key: string;
  label: string;
  ariaLabel: string;
  onRemove: () => void;
};

const Chip = ({
  label,
  ariaLabel,
  onRemove,
}: Omit<ChipDef, "key">) => (
  <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-0.5 text-xs text-foreground">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={ariaLabel}
      className="ml-0.5 rounded-sm p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-1"
    >
      <svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L9 9M9 1L1 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </span>
);

const ActiveFilterChips = ({
  filters,
  hasActiveFilters,
  properties,
  assignableUsers,
  availablePages,
  availableRules,
  onToggleSeverity,
  onToggleStatus,
  onTogglePropertyId,
  onTogglePageId,
  onToggleRuleId,
  onToggleAssigneeId,
  onClearPageIds,
  onClearRuleIds,
  onSetSearch,
}: ActiveFilterChipsProps) => {
  if (!hasActiveFilters) return null;

  const chips: ChipDef[] = [];

  // Severity — one chip per value
  for (const s of filters.severity) {
    const label = severityLabels[s];
    chips.push({
      key: `severity-${s}`,
      label,
      ariaLabel: `Remove ${label} filter`,
      onRemove: () => onToggleSeverity(s),
    });
  }

  // Status — one chip per value
  for (const s of filters.status) {
    const label = statusLabels[s];
    chips.push({
      key: `status-${s}`,
      label,
      ariaLabel: `Remove ${label} filter`,
      onRemove: () => onToggleStatus(s),
    });
  }

  // Property — one chip per value
  const propertyMap = new Map(properties.map((p) => [p.id, p.name]));
  for (const id of filters.propertyIds) {
    const label = propertyMap.get(id) ?? id;
    chips.push({
      key: `property-${id}`,
      label,
      ariaLabel: `Remove ${label} filter`,
      onRemove: () => onTogglePropertyId(id),
    });
  }

  // Assignee — one chip per value
  const assigneeMap = new Map<string, string>([
    ["unassigned", "Unassigned"],
    ...assignableUsers.map((u): [string, string] => [u.id, u.name]),
  ]);
  for (const id of filters.assigneeIds) {
    const label = assigneeMap.get(id) ?? id;
    chips.push({
      key: `assignee-${id}`,
      label,
      ariaLabel: `Remove ${label} filter`,
      onRemove: () => onToggleAssigneeId(id),
    });
  }

  // Pages — per-value when 1–2, collapsed to "X pages" when 3+
  if (filters.pageIds.length > 0) {
    if (filters.pageIds.length <= 2) {
      const pageMap = new Map(availablePages.map((p) => [p.id, p.title]));
      for (const id of filters.pageIds) {
        const label = pageMap.get(id) ?? id;
        chips.push({
          key: `page-${id}`,
          label,
          ariaLabel: `Remove ${label} filter`,
          onRemove: () => onTogglePageId(id),
        });
      }
    } else {
      chips.push({
        key: "pages-collapsed",
        label: `${filters.pageIds.length} pages`,
        ariaLabel: "Remove all page filters",
        onRemove: onClearPageIds,
      });
    }
  }

  // Rules — per-value when 1–2, collapsed to "X rules" when 3+
  if (filters.ruleIds.length > 0) {
    if (filters.ruleIds.length <= 2) {
      const ruleMap = new Map(availableRules.map((r) => [r.id, r.label]));
      for (const id of filters.ruleIds) {
        const label = ruleMap.get(id) ?? id;
        chips.push({
          key: `rule-${id}`,
          label,
          ariaLabel: `Remove ${label} filter`,
          onRemove: () => onToggleRuleId(id),
        });
      }
    } else {
      chips.push({
        key: "rules-collapsed",
        label: `${filters.ruleIds.length} rules`,
        ariaLabel: "Remove all rule filters",
        onRemove: onClearRuleIds,
      });
    }
  }

  // Search — single chip showing the raw query
  if (filters.search.trim() !== "") {
    const q = filters.search;
    chips.push({
      key: "search",
      label: `"${q}"`,
      ariaLabel: "Remove search filter",
      onRemove: () => onSetSearch(""),
    });
  }

  return (
    <div
      role="group"
      aria-label="Active filters"
      className="flex flex-wrap items-center gap-1.5"
    >
      {chips.map(({ key, label, ariaLabel, onRemove }) => (
        <Chip key={key} label={label} ariaLabel={ariaLabel} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ActiveFilterChips;
