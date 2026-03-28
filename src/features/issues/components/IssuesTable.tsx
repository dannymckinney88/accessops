"use client";

import { useState } from "react";
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
import { issueColumns } from "./columns";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface IssuesTableProps {
  violations: HydratedViolation[];
  activeViolationId: string | null;
  onRowClick: (id: string) => void;
}

const IssuesTable = ({
  violations,
  activeViolationId,
  onRowClick,
}: IssuesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "severity", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const table = useReactTable({
    data: violations,
    columns: issueColumns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Reset to page 0 whenever the data array changes (i.e. filters change).
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = violations.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

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
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const isActive = row.original.id === activeViolationId;
                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    data-violation-id={row.original.id}
                    onClick={() => onRowClick(row.original.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row.original.id);
                      }
                    }}
                    className={[
                      "border-b last:border-0 cursor-pointer outline-none transition-colors",
                      "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:bg-muted/40",
                      isActive ? "bg-accent" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-3 text-sm text-foreground"
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
          </table>
        </div>
      </div>

      {total > PAGE_SIZE_OPTIONS[0] && (
        <nav aria-label="Pagination" className="flex items-center justify-between px-1">
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

          <p className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
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
