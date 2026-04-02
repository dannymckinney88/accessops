import { flexRender, type Header } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import type { IssueViewMode } from "./IssueFilterBar";

interface IssueTableHeaderProps {
  headers: Header<HydratedViolation, unknown>[];
  viewMode: IssueViewMode;
}

export function IssueTableHeader({ headers, viewMode }: IssueTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b bg-muted/50">
        {headers.map((header) => {
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
                  {flexRender(header.column.columnDef.header, header.getContext())}
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
                    <ChevronsUpDown size={12} aria-hidden="true" className="opacity-40" />
                  )}
                </button>
              ) : (
                flexRender(header.column.columnDef.header, header.getContext())
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
