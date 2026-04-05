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
import { GroupedPageBody, GroupedRuleBody, FlatBody } from "./IssueTableRows";
import { IssuesBulkBar } from "./IssuesBulkBar";

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
  // remediationSort closes over rulePageCounts so it lives here
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

    const dateDiff =
      new Date(rowA.original.firstSeenAt).getTime() -
      new Date(rowB.original.firstSeenAt).getTime();
    if (dateDiff !== 0) return dateDiff;

    // Stable final tiebreaker — domain ID is unique so this always resolves equal rows.
    return rowA.original.id.localeCompare(rowB.original.id);
  };

  // ── State ────────────────────────────────────────────────────────────────────

  // Default: status asc (open → in-progress → fixed → verified → accepted-risk),
  // surfacing active work without implicit filter state.
  const [sorting, setSorting] = useState<SortingState>([{ id: "status", desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Clear selection on any meaningful boundary change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [violations, sorting, pagination.pageIndex, pagination.pageSize, viewMode]);

  // Reset collapsed groups when filters change or view mode switches.
  // Sorting intentionally does not reset collapse — users expect groups to stay
  // collapsed while re-ordering.
  useEffect(() => {
    setCollapsedGroups(new Set());
  }, [violations, viewMode]);

  // ── Table instance ───────────────────────────────────────────────────────────

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
    // Stable row identity from domain ID prevents index-based key drift and
    // hydration mismatches when sort order changes between server and client.
    getRowId: (row) => row.id,
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

  // ── Derived data ─────────────────────────────────────────────────────────────

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

  // ── Selection handlers ───────────────────────────────────────────────────────

  const currentPageRows = table.getRowModel().rows;
  const currentPageIds = currentPageRows.map((r) => r.original.id);
  const allPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const somePageSelected = currentPageIds.some((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) currentPageIds.forEach((id) => next.add(id));
      else currentPageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleGroupSelect = (groupIds: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) groupIds.forEach((id) => next.add(id));
      else groupIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleToggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;
  const showBulkBar =
    (viewMode === "flat" || viewMode === "grouped-page") && selectedIds.size > 0;

  const tableCaption =
    viewMode === "grouped-rule"
      ? "Accessibility issues grouped by rule"
      : viewMode === "grouped-page"
        ? "Accessibility issues grouped by page"
        : "Accessibility violations table";

  return (
    <div className="flex flex-col gap-3" data-issues-table>
      {showBulkBar && (
        <IssuesBulkBar
          selectedIds={selectedIds}
          assignableUsers={assignableUsers}
          onBulkAssign={onBulkAssign}
          onBulkStatus={onBulkStatus}
          onClearSelection={() => setSelectedIds(new Set())}
        />
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
              <GroupedPageBody
                pageGroups={pageGroups}
                collapsedGroups={collapsedGroups}
                selectedIds={selectedIds}
                visibleHeaderCount={visibleHeaders.length}
                activeViolationId={activeViolationId}
                assignableUsers={assignableUsers}
                rulePageCounts={rulePageCounts}
                onViolationRowClick={onViolationRowClick}
                onToggleGroup={handleToggleGroup}
                onToggleSelect={handleToggleSelect}
                onGroupSelect={handleGroupSelect}
                onAssign={onAssign}
              />
            ) : viewMode === "grouped-rule" ? (
              <GroupedRuleBody
                issues={sortedGroupedIssues}
                activeGroupId={activeGroupId}
                onRowClick={onGroupedIssueRowClick}
              />
            ) : (
              <FlatBody
                rows={currentPageRows}
                selectedIds={selectedIds}
                activeViolationId={activeViolationId}
                assignableUsers={assignableUsers}
                onRowClick={onViolationRowClick}
                onToggleSelect={handleToggleSelect}
                onAssign={onAssign}
              />
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
