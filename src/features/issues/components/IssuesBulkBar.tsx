"use client";

import { useState } from "react";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import { EDITABLE_STATUSES, STATUS_LABEL } from "../utils/statusOptions";

// ── Styles ─────────────────────────────────────────────────────────────────────

const bulkSelectClass =
  "h-8 rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

const bulkApplyClass =
  "h-8 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

// ── Props ──────────────────────────────────────────────────────────────────────

interface IssuesBulkBarProps {
  selectedIds: Set<string>;
  assignableUsers: User[];
  onBulkAssign: (ids: string[], assigneeId: string | null) => void;
  onBulkStatus: (ids: string[], status: RemediationStatus) => void;
  onClearSelection: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function IssuesBulkBar({
  selectedIds,
  assignableUsers,
  onBulkAssign,
  onBulkStatus,
  onClearSelection,
}: IssuesBulkBarProps) {
  const [assignValue, setAssignValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const count = selectedIds.size;

  const handleAssignApply = () => {
    if (!assignValue) return;
    onBulkAssign(Array.from(selectedIds), assignValue === "unassigned" ? null : assignValue);
    onClearSelection();
    setAssignValue("");
  };

  const handleStatusApply = () => {
    if (!statusValue) return;
    onBulkStatus(Array.from(selectedIds), statusValue as RemediationStatus);
    onClearSelection();
    setStatusValue("");
  };

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-accent/20 px-4 py-2.5"
    >
      <span className="text-sm font-semibold text-foreground">
        {count} {count === 1 ? "issue" : "issues"} selected
      </span>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Assign to</span>
        <select
          value={assignValue}
          onChange={(e) => setAssignValue(e.target.value)}
          aria-label="Bulk assign to"
          className={bulkSelectClass}
        >
          <option value="">Select…</option>
          <option value="unassigned">Unassign</option>
          {assignableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAssignApply}
          disabled={!assignValue}
          aria-label="Apply assignment"
          className={bulkApplyClass}
        >
          Apply
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Set status</span>
        <select
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          aria-label="Bulk set status"
          className={bulkSelectClass}
        >
          <option value="">Select…</option>
          {EDITABLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleStatusApply}
          disabled={!statusValue}
          aria-label="Apply status change"
          className={bulkApplyClass}
        >
          Apply
        </button>
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        aria-label="Deselect all"
        className="ml-auto h-8 rounded-md border border-transparent px-3 text-xs text-muted-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
      >
        Deselect all
      </button>
    </div>
  );
}
