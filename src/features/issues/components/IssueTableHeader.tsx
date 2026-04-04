import { flexRender, type Header } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";

interface SelectionHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  pageCount: number;
  onSelectAll: (checked: boolean) => void;
}

interface IssueTableHeaderProps {
  headers: Header<HydratedViolation, unknown>[];
  sortableColumns: ReadonlySet<string>;
  selectionProps?: SelectionHeaderProps;
  showCheckboxColumn?: boolean;
}

/** Resolve a column header def to plain text. Used to label the <th> directly
 *  so AT does not compute the name from the button's subtree. */
function getHeaderText(header: Header<HydratedViolation, unknown>): string {
  const def = header.column.columnDef.header;
  return typeof def === "string" ? def : header.id;
}

/** Description string for the sort button — announces current state and next
 *  action via aria-describedby, separate from the button's accessible name. */
function sortDescription(sorted: false | "asc" | "desc"): string {
  if (sorted === "asc") return "Sorted ascending. Activate to sort descending.";
  if (sorted === "desc") return "Sorted descending. Activate to clear sort.";
  return "Activate to sort ascending.";
}

export function IssueTableHeader({
  headers,
  sortableColumns,
  selectionProps,
  showCheckboxColumn,
}: IssueTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b bg-muted/50">
        {selectionProps ? (
          <th scope="col" className="w-10 px-3 py-2.5">
            <input
              type="checkbox"
              checked={selectionProps.allSelected}
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    selectionProps.someSelected && !selectionProps.allSelected;
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
          const canSort = sortableColumns.has(header.id) && header.column.getCanSort();

          const ariaSort =
            sorted === "asc"
              ? ("ascending" as const)
              : sorted === "desc"
                ? ("descending" as const)
                : canSort
                  ? ("none" as const)
                  : undefined;

          // Sortable <th>: pin accessible name to just the column text via aria-label.
          // Without this, AT computes the th name from its subtree and picks up the
          // button's aria-describedby content, announcing it on every associated cell.
          const thAriaLabel = canSort ? getHeaderText(header) : undefined;

          const descId = `sort-desc-${header.id}`;

          return (
            <th
              key={header.id}
              scope="col"
              aria-sort={ariaSort}
              aria-label={thAriaLabel}
              className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
            >
              {canSort ? (
                <>
                  {/* Button name = visible text (icons are aria-hidden).
                      Description = sort state + next action, read on focus only. */}
                  <button
                    type="button"
                    aria-describedby={descId}
                    onClick={header.column.getToggleSortingHandler()}
                    className="inline-flex items-center gap-1 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sorted === "asc" && <ChevronUp size={12} aria-hidden="true" />}
                    {sorted === "desc" && <ChevronDown size={12} aria-hidden="true" />}
                    {!sorted && (
                      <ChevronsUpDown size={12} aria-hidden="true" className="opacity-40" />
                    )}
                  </button>
                  <span id={descId} className="sr-only">
                    {sortDescription(sorted)}
                  </span>
                </>
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
