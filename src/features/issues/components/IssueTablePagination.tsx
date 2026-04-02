import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface IssueTablePaginationProps {
  table: Table<HydratedViolation>;
  total: number;
  pageIndex: number;
  pageSize: number;
}

export function IssueTablePagination({
  table,
  total,
  pageIndex,
  pageSize,
}: IssueTablePaginationProps) {
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  return (
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
  );
}
