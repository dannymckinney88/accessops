import { createColumnHelper } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";

const col = createColumnHelper<HydratedViolation>();

const severityOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const issueColumns = [
  col.accessor("impact", {
    id: "severity",
    header: "Severity",
    cell: (info) => <SeverityBadge severity={info.getValue()} />,
    sortingFn: (a, b) =>
      severityOrder[a.original.impact] - severityOrder[b.original.impact],
  }),

  col.accessor((row) => row.rule?.help ?? row.ruleId, {
    id: "rule",
    header: "Issue",
    cell: (info) => (
      <div>
        <p className="font-medium text-foreground leading-snug">
          {info.getValue()}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {info.row.original.ruleId}
        </p>
      </div>
    ),
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
        <p className="text-xs text-muted-foreground mt-0.5">
          {info.row.original.page?.path}
        </p>
      </div>
    ),
  }),

  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
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
