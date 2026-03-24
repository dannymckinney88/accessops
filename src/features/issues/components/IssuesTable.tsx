"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import { issueColumns } from "./columns";

interface IssuesTableProps {
  violations: HydratedViolation[];
  activeViolationId: string | null;
  onRowClick: (id: string) => void;
}

const IssuesTable = ({ violations, activeViolationId, onRowClick }: IssuesTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "severity", desc: false },
  ]);

  const table = useReactTable({
    data: violations,
    columns: issueColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
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
                  const ariaSort = sorted === "asc"
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
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
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
                  onClick={() => onRowClick(row.original.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(row.original.id);
                    }
                  }}
                  aria-current={isActive ? true : undefined}
                  className={[
                    "border-b last:border-0 cursor-pointer outline-none transition-colors",
                    "hover:bg-muted/50 focus-visible:bg-muted/50",
                    isActive ? "bg-accent" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssuesTable;
