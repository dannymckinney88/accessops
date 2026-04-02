"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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

const rowBaseClass =
  "cursor-pointer border-b last:border-0 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
    const sevDiff =
      severityOrder[rowA.original.impact] - severityOrder[rowB.original.impact];
    if (sevDiff !== 0) return sevDiff;

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
      if (b.criticalCount !== a.criticalCount)
        return b.criticalCount - a.criticalCount;
      return b.violations.length - a.violations.length;
    });
  }, [sortedViolations, viewMode]);

  const sortedGroupedIssues = useMemo(() => {
    if (viewMode !== "grouped-rule") return [];

    return [...groupedIssues].sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      if (b.affectedPagesCount !== a.affectedPagesCount) {
        return b.affectedPagesCount - a.affectedPagesCount;
      }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime()
      );
    });
  }, [groupedIssues, viewMode]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);
  const visibleColCount = table.getVisibleLeafColumns().length;

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
                  : "Accessibility violations"}
            </caption>
            <thead>
              <tr className="border-b bg-muted/50">
                {table
                  .getHeaderGroups()[0]
                  .headers.filter((header) => {
                    if (viewMode === "grouped-page") {
                      return header.id !== "page" && header.id !== "property";
                    }
                    if (viewMode === "grouped-rule") {
                      return [
                        "severity",
                        "rule",
                        "status",
                        "priority",
                        "firstSeenAt",
                      ].includes(header.id);
                    }
                    return true;
                  })
                  .map((header) => {
                    const sorted = header.column.getIsSorted();
                    const canSort =
                      viewMode === "flat" && header.column.getCanSort();
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
                              <ChevronUp size={12} aria-hidden="true" />
                            )}
                            {sorted === "desc" && (
                              <ChevronDown size={12} aria-hidden="true" />
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
                    <tr className="bg-muted/50">
                      <td colSpan={visibleColCount} className="py-0 pl-2 pr-3">
                        <button
                          type="button"
                          aria-expanded={!collapsed}
                          aria-label={`${collapsed ? "Expand" : "Collapse"} ${group.pageTitle}`}
                          onClick={() => toggleGroup(group.pageId)}
                          className="flex w-full items-center gap-3 rounded-sm py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <ChevronDown
                            size={14}
                            aria-hidden="true"
                            className={`shrink-0 text-muted-foreground ${collapsed ? "-rotate-90" : ""}`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold leading-snug text-foreground">
                              {group.pageTitle}
                            </p>
                            {group.pagePath && (
                              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                                {group.pagePath}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-4 text-xs">
                            {group.criticalCount > 0 && (
                              <span className="font-bold text-severity-critical">
                                {group.criticalCount} critical
                              </span>
                            )}
                            <span className="font-medium text-foreground/70">
                              {group.violations.length}{" "}
                              {group.violations.length === 1
                                ? "issue"
                                : "issues"}
                            </span>
                            {group.propertyName && (
                              <span className="hidden text-muted-foreground sm:inline">
                                {group.propertyName}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                    </tr>

                    {!collapsed &&
                      group.violations.map((violation) => {
                        const isActive = violation.id === activeViolationId;
                        return (
                          <tr
                            key={violation.id}
                            tabIndex={0}
                            data-issue-id={violation.id}
                            aria-selected={isActive}
                            onClick={() => onViolationRowClick(violation.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onViolationRowClick(violation.id);
                              }
                            }}
                            className={[
                              rowBaseClass,
                              isActive
                                ? "border-l-2 border-l-primary bg-accent"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <SeverityBadge severity={violation.impact} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <div>
                                <p className="font-medium leading-snug text-foreground">
                                  {violation.rule?.help ?? violation.ruleId}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {violation.ruleId}
                                  {(rulePageCounts.get(violation.ruleId) ?? 1) >
                                    1 && (
                                    <span className="ml-2 text-muted-foreground">
                                      · {rulePageCounts.get(violation.ruleId)}{" "}
                                      pages
                                    </span>
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <StatusBadge status={violation.status} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <PriorityBadge priority={violation.priority} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground whitespace-nowrap">
                              {formatDate(violation.firstSeenAt)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                );
              })
            ) : viewMode === "grouped-rule" ? (
              <tbody>
                {sortedGroupedIssues.map((issue) => {
                  const isActive = issue.id === activeGroupId;
                  return (
                    <tr
                      key={issue.id}
                      tabIndex={0}
                      data-issue-id={issue.id}
                      aria-selected={isActive}
                      onClick={() => onGroupedIssueRowClick(issue.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onGroupedIssueRowClick(issue.id);
                        }
                      }}
                      className={[
                        rowBaseClass,
                        isActive ? "border-l-2 border-l-primary bg-accent" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-3 py-2.5 align-top text-sm text-foreground">
                        <SeverityBadge severity={issue.severity} />
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground">
                        <div>
                          <p className="font-medium leading-snug text-foreground">
                            {issue.rule?.help ?? issue.ruleId}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {issue.ruleId}
                            <span className="ml-2 text-muted-foreground">
                              · affects {issue.affectedPagesCount}{" "}
                              {issue.affectedPagesCount === 1
                                ? "page"
                                : "pages"}
                            </span>
                            <span className="ml-2">
                              · {issue.totalInstances} instances
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground whitespace-nowrap">
                        {issue.affectedPropertiesCount === 1
                          ? (issue.affectedProperties[0]?.name ?? "—")
                          : `${issue.affectedPropertiesCount} properties`}
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground whitespace-nowrap">
                        {issue.affectedPagesCount === 1
                          ? (issue.affectedPages[0]?.title ?? "—")
                          : `${issue.affectedPagesCount} pages`}
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground">
                        <PriorityBadge priority={issue.priority} />
                      </td>
                      <td className="px-3 py-2.5 align-top text-sm text-foreground whitespace-nowrap">
                        {formatDate(issue.firstSeenAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isActive = row.original.id === activeViolationId;
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      data-issue-id={row.original.id}
                      aria-selected={isActive}
                      onClick={() => onViolationRowClick(row.original.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onViolationRowClick(row.original.id);
                        }
                      }}
                      className={[
                        rowBaseClass,
                        isActive ? "border-l-2 border-l-primary bg-accent" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2.5 align-top text-sm text-foreground"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {viewMode === "flat" && total > PAGE_SIZE_OPTIONS[0] && (
        <nav
          aria-label="Pagination"
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
              aria-label="Previous page"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-foreground outline-none transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
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
