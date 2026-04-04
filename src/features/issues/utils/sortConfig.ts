import type { SortingState } from "@tanstack/react-table";
import type { IssueViewMode } from "../components/IssueFilterBar";
import type { AggregatedIssue } from "./aggregateIssues";
import type { HydratedViolation } from "@/lib/data/index";

// ── Shared order maps ──────────────────────────────────────────────────────────

export const severityOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const statusOrder: Record<string, number> = {
  open: 0,
  "in-progress": 1,
  fixed: 2,
  verified: 3,
  "accepted-risk": 4,
};

export const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ── Per-view sortable column sets ──────────────────────────────────────────────

export const SORTABLE_COLUMNS: Record<IssueViewMode, ReadonlySet<string>> = {
  flat: new Set(["severity", "rule", "property", "page", "status", "assignee", "priority", "firstSeenAt"]),
  "grouped-page": new Set(["severity", "rule", "status", "assignee", "priority", "firstSeenAt"]),
  "grouped-rule": new Set(["severity", "rule", "status", "priority", "firstSeenAt"]),
};

// Columns shown in grouped-rule view (used to filter header cells)
export const GROUPED_RULE_VISIBLE: ReadonlySet<string> = new Set([
  "severity", "rule", "status", "priority", "firstSeenAt",
]);

// ── Page group shape ───────────────────────────────────────────────────────────

export interface PageGroupData {
  pageId: string;
  pageTitle: string;
  pagePath: string;
  propertyName: string;
  criticalCount: number;
  violations: HydratedViolation[];
}

// ── Sorting helpers ────────────────────────────────────────────────────────────

/** Sort aggregated (grouped-rule) rows by the active SortingState. */
export function sortAggregatedIssues(
  issues: AggregatedIssue[],
  sorting: SortingState,
): AggregatedIssue[] {
  if (sorting.length === 0) return [...issues];
  const { id, desc } = sorting[0];
  const dir = desc ? -1 : 1;

  return [...issues].sort((a, b) => {
    let diff = 0;
    switch (id) {
      case "severity":
        diff = severityOrder[a.severity] - severityOrder[b.severity];
        if (diff === 0) diff = b.affectedPagesCount - a.affectedPagesCount;
        break;
      case "rule":
        diff = (a.rule?.help ?? a.ruleId).localeCompare(b.rule?.help ?? b.ruleId);
        break;
      case "status":
        diff = statusOrder[a.status] - statusOrder[b.status];
        break;
      case "priority":
        diff = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "firstSeenAt":
        diff = new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime();
        break;
      default:
        diff = severityOrder[a.severity] - severityOrder[b.severity];
        break;
    }
    return diff * dir;
  });
}

/** Sort page group order by the active SortingState. Rows within each group are already
 *  ordered by TanStack's sorted row model — this only controls group sequence. */
export function sortPageGroups(
  groups: PageGroupData[],
  sorting: SortingState,
): PageGroupData[] {
  const fallback = (a: PageGroupData, b: PageGroupData) =>
    b.criticalCount - a.criticalCount || b.violations.length - a.violations.length;

  if (sorting.length === 0) return [...groups].sort(fallback);

  const { id, desc } = sorting[0];
  const dir = desc ? -1 : 1;

  return [...groups].sort((a, b) => {
    let diff = 0;
    switch (id) {
      case "severity": {
        const worstA = Math.min(...a.violations.map((v) => severityOrder[v.impact]));
        const worstB = Math.min(...b.violations.map((v) => severityOrder[v.impact]));
        diff = worstA - worstB;
        if (diff === 0) diff = b.violations.length - a.violations.length;
        break;
      }
      case "status": {
        const urgentA = Math.min(...a.violations.map((v) => statusOrder[v.status]));
        const urgentB = Math.min(...b.violations.map((v) => statusOrder[v.status]));
        diff = urgentA - urgentB;
        break;
      }
      case "priority": {
        const topA = Math.min(...a.violations.map((v) => priorityOrder[v.priority]));
        const topB = Math.min(...b.violations.map((v) => priorityOrder[v.priority]));
        diff = topA - topB;
        break;
      }
      case "firstSeenAt": {
        const oldestA = Math.min(...a.violations.map((v) => new Date(v.firstSeenAt).getTime()));
        const oldestB = Math.min(...b.violations.map((v) => new Date(v.firstSeenAt).getTime()));
        diff = oldestA - oldestB;
        break;
      }
      case "assignee": {
        // When sorted by assignee, violations[0] carries the alphabetically-first
        // assignee on the page; use that to order groups.
        const nameA = a.violations[0]?.assignee?.name ?? "";
        const nameB = b.violations[0]?.assignee?.name ?? "";
        diff = nameA.localeCompare(nameB);
        break;
      }
      default:
        return fallback(a, b);
    }
    return diff * dir;
  });
}
