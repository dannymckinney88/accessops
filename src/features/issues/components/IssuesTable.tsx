"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingFn,
  type SortingState,
} from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import { issueColumns } from "./columns";
import type { AggregatedIssue } from "../utils/aggregateIssues";
import type { IssueViewMode } from "./IssueFilterBar";
import {
  SORTABLE_COLUMNS,
  GROUPED_RULE_VISIBLE,
  sortAggregatedIssues,
  sortPageGroups,
  type PageGroupData,
  severityOrder,
  statusOrder,
} from "../utils/sortConfig";
import { IssueTableHeader } from "./IssueTableHeader";
import { IssueTablePagination, PAGE_SIZE_OPTIONS } from "./IssueTablePagination";
import {
  PageGroupHeader,
  GroupedPageRow,
  GroupedRuleRow,
  FlatViolationRow,
} from "./IssueTableRows";
import { EDITABLE_STATUSES, STATUS_LABEL } from "../utils/statusOptions";

// ── Props ──────────────────────────────────────────────────────────────────────

interface IssuesTableProps {
  violations: HydratedViolation[];
  groupedIssues: AggregatedIssue[];
  activeViolationId: string | null;
  activeGroupId: string | null;
  rulePageCounts: Map<string, number>;
  viewMode: IssueViewMode;
  assignableUsers: User[];
  onViolationRowClick: (id: string) => void;
  onGroupedIssueRowClick: (id: string) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
  onBulkAssign: (ids: string[], assigneeId: string | null) => void;
  onBulkStatus: (ids: string[], status: RemediationStatus) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

const IssuesTable = ({
  violations,
  groupedIssues,
  activeViolationId,
  activeGroupId,
  rulePageCounts,
  viewMode,
  assignableUsers,
  onViolationRowClick,
  onGroupedIssueRowClick,
  onAssign,
  onBulkAssign,
  onBulkStatus,
}: IssuesTableProps) => {
  const remediationSort: SortingFn<HydratedViolation> = (rowA, rowB) => {
    const severityDiff =
      severityOrder[rowA.original.impact] - severityOrder[rowB.original.impact];
    if (severityDiff !== 0) return severityDiff;

    const countA = rulePageCounts.get(rowA.original.ruleId) ?? 1;
    const countB = rulePageCounts.get(rowB.original.ruleId) ?? 1;
    if (countB !== countA) return countB - countA;

    const statusDiff =
      statusOrder[rowA.original.status] - statusOrder[rowB.original.status];
    if (statusDiff !== 0) return statusDiff;

    return (
      new Date(rowA.original.firstSeenAt).getTime() -
      new Date(rowB.original.firstSeenAt).getTime()
    );
  };

  const [sorting, setSorting] = useState<SortingState>([
    { id: "severity", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAssignValue, setBulkAssignValue] = useState("");
  const [bulkStatusValue, setBulkStatusValue] = useState("");

  // Clear selection on any meaningful boundary change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [violations, sorting, pagination.pageIndex, pagination.pageSize, viewMode]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Hide "assignee" in grouped-rule; hide "page"/"property" in grouped-page
  const columnVisibility: Record<string, boolean> =
    viewMode === "grouped-page"
      ? { page: false, property: false }
      : viewMode === "grouped-rule"
        ? { assignee: false }
        : {};

  const table = useReactTable({
    data: violations,
    columns: issueColumns,
    meta: { rulePageCounts },
    sortingFns: { remediationSort },
    state: { sorting, pagination, columnVisibility },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });

  const sortedViolations = useMemo(
    () => table.getSortedRowModel().rows.map((row) => row.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, sorting, violations],
  );

  const pageGroups = useMemo(() => {
    if (viewMode !== "grouped-page") return [];

    const map = new Map<string, PageGroupData>();

    for (const violation of sortedViolations) {
      const key = violation.page?.id ?? "__none__";
      if (!map.has(key)) {
        map.set(key, {
          pageId: key,
          pageTitle: violation.page?.title ?? "No page",
          pagePath: violation.page?.path ?? "",
          propertyName: violation.property?.name ?? "",
          criticalCount: 0,
          violations: [],
        });
      }
      const group = map.get(key)!;
      group.violations.push(violation);
      if (violation.impact === "critical") group.criticalCount += 1;
    }

    return sortPageGroups(Array.from(map.values()), sorting);
  }, [sortedViolations, viewMode, sorting]);

  const sortedGroupedIssues = useMemo(() => {
    if (viewMode !== "grouped-rule") return [];
    return sortAggregatedIssues(groupedIssues, sorting);
  }, [groupedIssues, viewMode, sorting]);

  const allHeaders = table.getHeaderGroups()[0].headers;
  const visibleHeaders = allHeaders.filter((h) => {
    if (viewMode === "grouped-page") return h.id !== "page" && h.id !== "property";
    if (viewMode === "grouped-rule") return GROUPED_RULE_VISIBLE.has(h.id);
    return true;
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;

  const currentPageRows = table.getRowModel().rows;
  const currentPageIds = currentPageRows.map((r) => r.original.id);
  const allPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const somePageSelected = currentPageIds.some((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.add(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkAssignApply = () => {
    if (!bulkAssignValue) return;
    const ids = Array.from(selectedIds);
    onBulkAssign(ids, bulkAssignValue === "unassigned" ? null : bulkAssignValue);
    setSelectedIds(new Set());
    setBulkAssignValue("");
  };

  const handleBulkStatusApply = () => {
    if (!bulkStatusValue) return;
    const ids = Array.from(selectedIds);
    onBulkStatus(ids, bulkStatusValue as RemediationStatus);
    setSelectedIds(new Set());
    setBulkStatusValue("");
  };

  const tableCaption =
    viewMode === "grouped-rule"
      ? "Accessibility issues grouped by rule"
      : viewMode === "grouped-page"
        ? "Accessibility issues grouped by page"
        : "Accessibility violations table";

  const selectionCount = selectedIds.size;
  const showBulkBar = (viewMode === "flat" || viewMode === "grouped-page") && selectionCount > 0;

  const bulkSelectClass =
    "h-8 rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

  const bulkApplyClass =
    "h-8 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col gap-3" data-issues-table>
      {/* Bulk action bar */}
      {showBulkBar && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-accent/20 px-4 py-2.5"
        >
          <span className="text-sm font-semibold text-foreground">
            {selectionCount} {selectionCount === 1 ? "issue" : "issues"} selected
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Assign to</span>
            <select
              value={bulkAssignValue}
              onChange={(e) => setBulkAssignValue(e.target.value)}
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
              onClick={handleBulkAssignApply}
              disabled={!bulkAssignValue}
              aria-label="Apply assignment"
              className={bulkApplyClass}
            >
              Apply
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Set status</span>
            <select
              value={bulkStatusValue}
              onChange={(e) => setBulkStatusValue(e.target.value)}
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
              onClick={handleBulkStatusApply}
              disabled={!bulkStatusValue}
              aria-label="Apply status change"
              className={bulkApplyClass}
            >
              Apply
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Deselect all"
            className="ml-auto h-8 rounded-md border border-transparent px-3 text-xs text-muted-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2"
          >
            Deselect all
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{tableCaption}</caption>

            <IssueTableHeader
              headers={visibleHeaders}
              sortableColumns={SORTABLE_COLUMNS[viewMode]}
              showCheckboxColumn={viewMode === "grouped-page"}
              selectionProps={
                viewMode === "flat"
                  ? {
                      allSelected: allPageSelected,
                      someSelected: somePageSelected,
                      pageCount: currentPageIds.length,
                      onSelectAll: handleSelectAll,
                    }
                  : undefined
              }
            />

            {viewMode === "grouped-page" ? (
              pageGroups.map((group, index) => {
                const collapsed = collapsedGroups.has(group.pageId);
                const groupIds = group.violations.map((v) => v.id);
                const groupAllSelected =
                  groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));
                const groupSomeSelected = groupIds.some((id) => selectedIds.has(id));
                return (
                  <tbody
                    key={group.pageId}
                    className={
                      index > 0 ? "border-t-4 border-border/50" : "border-t border-border/30"
                    }
                  >
                    <PageGroupHeader
                      pageTitle={group.pageTitle}
                      pagePath={group.pagePath}
                      propertyName={group.propertyName}
                      issueCount={group.violations.length}
                      criticalCount={group.criticalCount}
                      collapsed={collapsed}
                      colSpan={visibleHeaders.length}
                      onToggle={() => toggleGroup(group.pageId)}
                      selectionProps={{
                        allSelected: groupAllSelected,
                        someSelected: groupSomeSelected,
                        groupViolationCount: group.violations.length,
                        onSelectGroup: (checked) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (checked) groupIds.forEach((id) => next.add(id));
                            else groupIds.forEach((id) => next.delete(id));
                            return next;
                          });
                        },
                      }}
                    />
                    {!collapsed &&
                      group.violations.map((violation) => (
                        <GroupedPageRow
                          key={violation.id}
                          violation={violation}
                          isActive={violation.id === activeViolationId}
                          isSelected={selectedIds.has(violation.id)}
                          pageCount={rulePageCounts.get(violation.ruleId) ?? 1}
                          assignableUsers={assignableUsers}
                          onRowClick={onViolationRowClick}
                          onToggleSelect={handleToggleSelect}
                          onAssign={onAssign}
                        />
                      ))}
                  </tbody>
                );
              })
            ) : viewMode === "grouped-rule" ? (
              <tbody>
                {sortedGroupedIssues.map((issue) => (
                  <GroupedRuleRow
                    key={issue.id}
                    issue={issue}
                    isActive={issue.id === activeGroupId}
                    onRowClick={onGroupedIssueRowClick}
                  />
                ))}
              </tbody>
            ) : (
              <tbody>
                {currentPageRows.map((row) => (
                  <FlatViolationRow
                    key={row.id}
                    row={row}
                    isActive={row.original.id === activeViolationId}
                    isSelected={selectedIds.has(row.original.id)}
                    assignableUsers={assignableUsers}
                    onRowClick={onViolationRowClick}
                    onToggleSelect={handleToggleSelect}
                    onAssign={onAssign}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {viewMode === "flat" && total > PAGE_SIZE_OPTIONS[0] && (
        <IssueTablePagination
          table={table}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default IssuesTable;
