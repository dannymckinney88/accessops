import { flexRender, type Header } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import type { IssueViewMode } from "./IssueFilterBar";

interface SelectionHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  pageCount: number;
  onSelectAll: (checked: boolean) => void;
}

interface IssueTableHeaderProps {
  headers: Header<HydratedViolation, unknown>[];
  viewMode: IssueViewMode;
  selectionProps?: SelectionHeaderProps;
  showCheckboxColumn?: boolean;
}

export function IssueTableHeader({ headers, viewMode, selectionProps, showCheckboxColumn }: IssueTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b bg-muted/50">
        {selectionProps ? (
          <th scope="col" className="w-10 px-3 py-2.5">
            <input
              type="checkbox"
              checked={selectionProps.allSelected}
              ref={(el) => {
                if (el) el.indeterminate = selectionProps.someSelected && !selectionProps.allSelected;
              }}
              onChange={(e) => selectionProps.onSelectAll(e.target.checked)}
              aria-label={`Select all on this page (${selectionProps.pageCount})`}
              className="rounded border-input outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          </th>
        ) : showCheckboxColumn ? (
          <th scope="col" className="w-10 px-3 py-2.5" />
        ) : null}
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
