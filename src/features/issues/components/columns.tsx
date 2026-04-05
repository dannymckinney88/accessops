import { createColumnHelper, type SortingFn } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { statusOrder, priorityOrder } from "../utils/sortConfig";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    rulePageCounts?: Map<string, number>;
  }
  interface SortingFns {
    remediationSort: SortingFn<unknown>;
  }
}

const col = createColumnHelper<HydratedViolation>();

export const issueColumns = [
  col.accessor("impact", {
    id: "severity",
    header: "Severity",
    cell: (info) => <SeverityBadge severity={info.getValue()} />,
    sortingFn: "remediationSort",
  }),

  col.accessor((row) => row.rule?.help ?? row.ruleId, {
    id: "rule",
    header: "Issue",
    cell: (info) => {
      const ruleId = info.row.original.ruleId;
      const pageCount =
        info.table.options.meta?.rulePageCounts?.get(ruleId) ?? 1;
      return (
        <div>
          {/* span[block] not p — this div is rendered inside a <button> in FlatViolationRow */}
          <span className="block font-medium leading-snug text-foreground">
            {info.getValue()}
          </span>
          <span className="block mt-0.5 text-xs text-muted-foreground">
            {info.row.original.ruleId}
            {pageCount > 1 && (
              <span
                className="ml-2 text-muted-foreground"
                title={`This rule has violations on ${pageCount} pages`}
              >
                · {pageCount} pages
              </span>
            )}
          </span>
        </div>
      );
    },
  }),

  col.accessor((row) => row.property?.name ?? "—", {
    id: "property",
    header: "Property",
  }),

  col.accessor((row) => row.page?.title ?? "—", {
    id: "page",
    header: "Page",
    cell: (info) => (
      <div>
        <p>{info.getValue()}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {info.row.original.page?.path}
        </p>
      </div>
    ),
  }),

  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
    sortingFn: (a, b) => {
      const diff = statusOrder[a.original.status] - statusOrder[b.original.status];
      return diff !== 0 ? diff : a.original.id.localeCompare(b.original.id);
    },
  }),

  col.accessor((row) => row.assignee?.name ?? "—", {
    id: "assignee",
    header: "Assigned",
  }),

  col.accessor("priority", {
    header: "Priority",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
    sortingFn: (a, b) => {
      const diff = priorityOrder[a.original.priority] - priorityOrder[b.original.priority];
      return diff !== 0 ? diff : a.original.id.localeCompare(b.original.id);
    },
  }),

  col.accessor("firstSeenAt", {
    header: "First seen",
    cell: (info) => {
      const iso = info.getValue();
      const display = new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const full = new Date(iso).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      return (
        <span className="whitespace-nowrap" title={full}>
          {display}
        </span>
      );
    },
  }),
];
