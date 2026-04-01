"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { issueColumns } from "./columns";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const severityOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

interface IssuesTableProps {
  violations: HydratedViolation[];
  activeViolationId: string | null;
  rulePageCounts: Map<string, number>;
  viewMode: "flat" | "grouped";
  onRowClick: (id: string) => void;
}

const rowBaseClass =
  "border-b last:border-0 cursor-pointer outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:bg-muted/40";

const IssuesTable = ({
  violations,
  activeViolationId,
  rulePageCounts,
  viewMode,
  onRowClick,
}: IssuesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "severity", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  // Tracks which page groups are collapsed. Default: all expanded (empty set).
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (pageId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  // In grouped mode, hide page and property columns (redundant with group headers).
  const columnVisibility: Record<string, boolean> =
    viewMode === "grouped" ? { page: false, property: false } : {};

  const table = useReactTable({
    data: violations,
    columns: issueColumns,
    meta: { rulePageCounts },
    state: { sorting, pagination, columnVisibility },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });

  // Grouped mode: sort violations by severity within each page group,
  // then order groups by most critical issues first.
  const pageGroups = useMemo(() => {
    if (viewMode !== "grouped") return null;
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
    for (const v of violations) {
      const key = v.page?.id ?? "__none__";
      if (!map.has(key)) {
        map.set(key, {
          pageId: key,
          pageTitle: v.page?.title ?? "No page",
          pagePath: v.page?.path ?? "",
          propertyName: v.property?.name ?? "",
          criticalCount: 0,
          violations: [],
        });
      }
      map.get(key)!.violations.push(v);
    }
    for (const g of map.values()) {
      g.violations.sort(
        (a, b) => severityOrder[a.impact] - severityOrder[b.impact],
      );
      g.criticalCount = g.violations.filter(
        (v) => v.impact === "critical",
      ).length;
    }
    return Array.from(map.values()).sort((a, b) => {
      if (b.criticalCount !== a.criticalCount)
        return b.criticalCount - a.criticalCount;
      return b.violations.length - a.violations.length;
    });
  }, [violations, viewMode]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  const visibleColCount = table.getVisibleLeafColumns().length;

  return (
    <div className="flex flex-col gap-3" data-issues-table>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Accessibility violations</caption>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();
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
                            className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors"
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
              ))}
            </thead>

            {viewMode === "grouped" && pageGroups ? (
              // Grouped mode: one <tbody> per page, collapsible group header + issue rows.
              pageGroups.map((group) => {
                const collapsed = collapsedGroups.has(group.pageId);
                return (
                  <tbody key={group.pageId} className="border-t-2 border-border/40">
                    {/* Group header row */}
                    <tr className="bg-muted/30 hover:bg-muted/50 transition-colors">
                      <td colSpan={visibleColCount} className="px-3 py-0">
                        <button
                          type="button"
                          aria-expanded={!collapsed}
                          onClick={() => toggleGroup(group.pageId)}
                          className="flex w-full items-center gap-2.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-sm"
                        >
                          <ChevronDown
                            size={14}
                            aria-hidden="true"
                            className={`shrink-0 text-muted-foreground transition-transform duration-150 ${
                              collapsed ? "-rotate-90" : ""
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground">
                              {group.pageTitle}
                            </span>
                            {group.pagePath && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                {group.pagePath}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs">
                            {group.criticalCount > 0 && (
                              <span className="font-semibold text-severity-critical">
                                {group.criticalCount}{" "}
                                {group.criticalCount === 1
                                  ? "critical"
                                  : "critical"}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              {group.violations.length}{" "}
                              {group.violations.length === 1
                                ? "issue"
                                : "issues"}
                            </span>
                            {group.propertyName && (
                              <span className="text-muted-foreground/50">
                                {group.propertyName}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                    </tr>

                    {/* Issue rows — hidden when group is collapsed */}
                    {!collapsed &&
                      group.violations.map((v) => {
                        const isActive = v.id === activeViolationId;
                        const pageCount = rulePageCounts.get(v.ruleId) ?? 1;
                        return (
                          <tr
                            key={v.id}
                            tabIndex={0}
                            data-violation-id={v.id}
                            aria-selected={isActive}
                            onClick={() => onRowClick(v.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onRowClick(v.id);
                              }
                            }}
                            className={[
                              rowBaseClass,
                              isActive
                                ? "bg-accent border-l-2 border-l-primary"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <SeverityBadge severity={v.impact} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <div>
                                <p className="font-medium leading-snug">
                                  {v.rule?.help ?? v.ruleId}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {v.ruleId}
                                  {pageCount > 1 && (
                                    <span className="ml-2 text-primary/60">
                                      · {pageCount} pages
                                    </span>
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <StatusBadge status={v.status} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground">
                              <PriorityBadge priority={v.priority} />
                            </td>
                            <td className="px-3 py-2.5 align-top text-sm text-foreground whitespace-nowrap">
                              {new Date(v.firstSeenAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                );
              })
            ) : (
              // Flat mode: standard paginated rows.
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isActive = row.original.id === activeViolationId;
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      data-violation-id={row.original.id}
                      aria-selected={isActive}
                      onClick={() => onRowClick(row.original.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row.original.id);
                        }
                      }}
                      className={[
                        rowBaseClass,
                        isActive ? "bg-accent border-l-2 border-l-primary" : "",
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
              className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background text-foreground outline-none hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background text-foreground outline-none hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
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
