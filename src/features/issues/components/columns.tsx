import { createColumnHelper, type SortingFn } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    rulePageCounts?: Map<string, number>;
  }
  interface SortingFns {
    remediationSort: SortingFn<unknown>;
  }
}

const col = createColumnHelper<HydratedViolation>();

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

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
          <p className="font-medium text-foreground leading-snug">
            {info.getValue()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {info.row.original.ruleId}
            {pageCount > 1 && (
              <span
                className="ml-2 text-muted-foreground"
                title={`This rule has violations on ${pageCount} pages`}
              >
                · {pageCount} pages
              </span>
            )}
          </p>
        </div>
      );
    },
  }),

  col.accessor((row) => row.property?.name ?? "—", {
    id: "property",
    header: "Property",
    enableSorting: false,
  }),

  col.accessor((row) => row.page?.title ?? "—", {
    id: "page",
    header: "Page",
    enableSorting: false,
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
  }),

  col.accessor("priority", {
    header: "Priority",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
    sortingFn: (a, b) =>
      priorityOrder[a.original.priority] - priorityOrder[b.original.priority],
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
