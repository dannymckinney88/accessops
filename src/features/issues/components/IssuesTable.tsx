"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type PaginationState,
  type SortingFn,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { issueColumns } from "./columns";
import type { AggregatedIssue } from "../utils/aggregateIssues";
import type { IssueViewMode } from "./IssueFilterBar";

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const severityOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const statusOrder: Record<string, number> = {
  open: 0,
  "in-progress": 1,
  fixed: 2,
  verified: 3,
  "accepted-risk": 4,
};

const rowBaseClass =
  "border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50";

const rowActiveClass = "border-l-2 border-l-primary bg-accent/40";

const triggerButtonClass =
  "w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ── Local row subcomponents ────────────────────────────────────────────────────
//
// Interaction model:
//   • <tr onClick> catches all mouse clicks (full-row activation)
//   • <button> inside a plain <td> is the sole keyboard / AT entry point
//   • Button has no onClick — Enter/Space fire a click that bubbles to <tr>
//   • Button accessible name = visible rule text + sr-only ", open details"

interface PageGroupHeaderProps {
  pageTitle: string;
  pagePath: string;
  propertyName: string;
  issueCount: number;
  criticalCount: number;
  collapsed: boolean;
  colSpan: number;
  onToggle: () => void;
}

function PageGroupHeader({
  pageTitle,
  pagePath,
  propertyName,
  issueCount,
  criticalCount,
  collapsed,
  colSpan,
  onToggle,
}: PageGroupHeaderProps) {
  return (
    <tr className="bg-muted/50">
      <td colSpan={colSpan} className="py-0 pl-2 pr-3">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? "Expand" : "Collapse"} ${pageTitle}, ${issueCount} ${issueCount === 1 ? "issue" : "issues"}`}
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-sm py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`shrink-0 text-muted-foreground ${collapsed ? "-rotate-90" : ""}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-foreground">
              {pageTitle}
            </p>
            {pagePath && (
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                {pagePath}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-xs">
            {criticalCount > 0 && (
              <span className="font-bold text-severity-critical">
                {criticalCount} critical
              </span>
            )}
            <span className="font-medium text-foreground/70">
              {issueCount} {issueCount === 1 ? "issue" : "issues"}
            </span>
            {propertyName && (
              <span className="hidden text-muted-foreground sm:inline">
                {propertyName}
              </span>
            )}
          </div>
        </button>
      </td>
    </tr>
  );
}

interface GroupedPageRowProps {
  violation: HydratedViolation;
  isActive: boolean;
  pageCount: number;
  onRowClick: (id: string) => void;
}

function GroupedPageRow({
  violation,
  isActive,
  pageCount,
  onRowClick,
}: GroupedPageRowProps) {
  return (
    <tr
      data-issue-id={violation.id}
      onClick={() => onRowClick(violation.id)}
      className={[rowBaseClass, isActive ? rowActiveClass : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <SeverityBadge severity={violation.impact} />
      </td>

      <td className="px-3 py-2.5 align-top text-sm font-normal text-foreground">
        <button
          type="button"
          aria-current={isActive ? "true" : undefined}
          className={triggerButtonClass}
        >
          <p className="font-medium leading-snug text-foreground underline-offset-4 hover:underline">
            {violation.rule?.help ?? violation.ruleId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {violation.ruleId}
            {pageCount > 1 && (
              <span className="ml-2 text-muted-foreground">
                · {pageCount} pages
              </span>
            )}
          </p>
          <span className="sr-only">, open details</span>
        </button>
      </td>

      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <StatusBadge status={violation.status} />
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <PriorityBadge priority={violation.priority} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-sm text-foreground">
        {formatDate(violation.firstSeenAt)}
      </td>
    </tr>
  );
}

interface GroupedRuleRowProps {
  issue: AggregatedIssue;
  isActive: boolean;
  onRowClick: (id: string) => void;
}

function GroupedRuleRow({ issue, isActive, onRowClick }: GroupedRuleRowProps) {
  return (
    <tr
      data-issue-id={issue.id}
      onClick={() => onRowClick(issue.id)}
      className={[rowBaseClass, isActive ? rowActiveClass : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <SeverityBadge severity={issue.severity} />
      </td>

      <td className="px-3 py-2.5 align-top text-sm font-normal text-foreground">
        <button
          type="button"
          aria-current={isActive ? "true" : undefined}
          className={triggerButtonClass}
        >
          <p className="font-medium leading-snug text-foreground underline-offset-4 hover:underline">
            {issue.rule?.help ?? issue.ruleId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {issue.ruleId}
            <span className="ml-2 text-muted-foreground">
              · affects {issue.affectedPagesCount}{" "}
              {issue.affectedPagesCount === 1 ? "page" : "pages"}
            </span>
            <span className="ml-2 text-muted-foreground">
              · {issue.totalInstances} instances
            </span>
            <span className="ml-2 text-muted-foreground">
              ·{" "}
              {issue.affectedPropertiesCount === 1
                ? (issue.affectedProperties[0]?.name ?? "—")
                : `${issue.affectedPropertiesCount} properties`}
            </span>
          </p>
          <span className="sr-only">, open details</span>
        </button>
      </td>

      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <StatusBadge status={issue.status} />
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <PriorityBadge priority={issue.priority} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-sm text-foreground">
        {formatDate(issue.firstSeenAt)}
      </td>
    </tr>
  );
}

interface FlatViolationRowProps {
  row: Row<HydratedViolation>;
  isActive: boolean;
  onRowClick: (id: string) => void;
}

function FlatViolationRow({
  row,
  isActive,
  onRowClick,
}: FlatViolationRowProps) {
  return (
    <tr
      data-issue-id={row.original.id}
      onClick={() => onRowClick(row.original.id)}
      className={[rowBaseClass, isActive ? rowActiveClass : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "rule") {
          return (
            <td
              key={cell.id}
              className="px-3 py-2.5 align-top text-sm font-normal text-foreground"
            >
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                className={triggerButtonClass}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                <span className="sr-only">, open details</span>
              </button>
            </td>
          );
        }

        return (
          <td
            key={cell.id}
            className="px-3 py-2.5 align-top text-sm text-foreground"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface IssuesTableProps {
  violations: HydratedViolation[];
  groupedIssues: AggregatedIssue[];
  activeViolationId: string | null;
  activeGroupId: string | null;
  rulePageCounts: Map<string, number>;
  viewMode: IssueViewMode;
  onViolationRowClick: (id: string) => void;
  onGroupedIssueRowClick: (id: string) => void;
}

const IssuesTable = ({
  violations,
  groupedIssues,
  activeViolationId,
  activeGroupId,
  rulePageCounts,
  viewMode,
  onViolationRowClick,
  onGroupedIssueRowClick,
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const columnVisibility: Record<string, boolean> =
    viewMode === "grouped-page" ? { page: false, property: false } : {};

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

    const map = new Map<
      string,
      {
        pageId: string;
        pageTitle: string;
        pagePath: string;
        propertyName: string;
        criticalCount: number;
        violations: HydratedViolation[];
      }
    >();

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

    return Array.from(map.values()).sort((a, b) => {
      if (b.criticalCount !== a.criticalCount) return b.criticalCount - a.criticalCount;
      return b.violations.length - a.violations.length;
    });
  }, [sortedViolations, viewMode]);

  const sortedGroupedIssues = useMemo(() => {
    if (viewMode !== "grouped-rule") return [];

    return [...groupedIssues].sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      if (b.affectedPagesCount !== a.affectedPagesCount)
        return b.affectedPagesCount - a.affectedPagesCount;
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime();
    });
  }, [groupedIssues, viewMode]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  const visibleColCount = table
    .getVisibleLeafColumns()
    .filter((column) => {
      if (viewMode === "grouped-page")
        return column.id !== "page" && column.id !== "property";
      if (viewMode === "grouped-rule")
        return ["severity", "rule", "status", "priority", "firstSeenAt"].includes(column.id);
      return true;
    }).length;

  return (
    <div className="flex flex-col gap-3" data-issues-table>
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {viewMode === "grouped-rule"
                ? "Accessibility issues grouped by rule"
                : viewMode === "grouped-page"
                  ? "Accessibility issues grouped by page"
                  : "Accessibility violations table"}
            </caption>

            <thead>
              <tr className="border-b bg-muted/50">
                {table
                  .getHeaderGroups()[0]
                  .headers.filter((header) => {
                    if (viewMode === "grouped-page")
                      return header.id !== "page" && header.id !== "property";
                    if (viewMode === "grouped-rule")
                      return ["severity", "rule", "status", "priority", "firstSeenAt"].includes(
                        header.id,
                      );
                    return true;
                  })
                  .map((header) => {
                    const sorted = header.column.getIsSorted();
                    const canSort = viewMode === "flat" && header.column.getCanSort();

                    const ariaSort =
                      sorted === "asc"
                        ? ("ascending" as const)
                        : sorted === "desc"
                          ? ("descending" as const)
                          : canSort
                            ? ("none" as const)
                            : undefined;

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={ariaSort}
                        className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === "asc" && (
                              <>
                                <ChevronUp size={12} aria-hidden="true" />
                                <span className="sr-only"> (ascending)</span>
                              </>
                            )}
                            {sorted === "desc" && (
                              <>
                                <ChevronDown size={12} aria-hidden="true" />
                                <span className="sr-only"> (descending)</span>
                              </>
                            )}
                            {!sorted && (
                              <ChevronsUpDown
                                size={12}
                                aria-hidden="true"
                                className="opacity-40"
                              />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
              </tr>
            </thead>

            {viewMode === "grouped-page" ? (
              pageGroups.map((group, index) => {
                const collapsed = collapsedGroups.has(group.pageId);

                return (
                  <tbody
                    key={group.pageId}
                    className={
                      index > 0
                        ? "border-t-4 border-border/50"
                        : "border-t border-border/30"
                    }
                  >
                    <PageGroupHeader
                      pageTitle={group.pageTitle}
                      pagePath={group.pagePath}
                      propertyName={group.propertyName}
                      issueCount={group.violations.length}
                      criticalCount={group.criticalCount}
                      collapsed={collapsed}
                      colSpan={visibleColCount}
                      onToggle={() => toggleGroup(group.pageId)}
                    />

                    {!collapsed &&
                      group.violations.map((violation) => (
                        <GroupedPageRow
                          key={violation.id}
                          violation={violation}
                          isActive={violation.id === activeViolationId}
                          pageCount={rulePageCounts.get(violation.ruleId) ?? 1}
                          onRowClick={onViolationRowClick}
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
                {table.getRowModel().rows.map((row) => (
                  <FlatViolationRow
                    key={row.id}
                    row={row}
                    isActive={row.original.id === activeViolationId}
                    onRowClick={onViolationRowClick}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {viewMode === "flat" && total > PAGE_SIZE_OPTIONS[0] && (
        <nav
          aria-label="Issues pagination"
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-2">
            <label
              htmlFor="issues-page-size"
              className="text-xs text-muted-foreground"
            >
              Rows per page
            </label>

            <select
              id="issues-page-size"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <p
            className="text-xs text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {total === 0 ? "No results" : `${start}–${end} of ${total}`}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page of issues"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-foreground outline-none transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page of issues"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-foreground outline-none transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default IssuesTable;
