import { flexRender, type Row } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import type { User } from "@/lib/data/types/domain";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import type { AggregatedIssue } from "../utils/aggregateIssues";

// ── Shared row styles ──────────────────────────────────────────────────────────

export const rowBaseClass =
  "border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50";

export const rowActiveClass = "border-l-2 border-l-primary bg-accent/40";

export const rowSelectedClass = "bg-interactive-selected/10";

export const triggerButtonClass =
  "w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const assignSelectClass =
  "h-7 w-full min-w-24 rounded border border-input bg-background px-2 text-xs text-foreground outline-none transition-colors hover:border-interactive-border-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-1";

// ── Interaction model ──────────────────────────────────────────────────────────
//
//   • <tr onClick> catches all mouse clicks (full-row activation)
//   • <button> inside a plain <td> is the sole keyboard / AT entry point
//   • Button has no onClick — Enter/Space fire a click that bubbles to <tr>
//   • Button accessible name = visible rule text + sr-only ", open details"
//   • Checkbox <td> and assignee <td> stop propagation to prevent drawer open

// ── PageGroupHeader ────────────────────────────────────────────────────────────

interface PageGroupHeaderProps {
  pageTitle: string;
  pagePath: string;
  propertyName: string;
  issueCount: number;
  criticalCount: number;
  collapsed: boolean;
  colSpan: number;
  onToggle: () => void;
}

export function PageGroupHeader({
  pageTitle,
  pagePath,
  propertyName,
  issueCount,
  criticalCount,
  collapsed,
  colSpan,
  onToggle,
}: PageGroupHeaderProps) {
  return (
    <tr className="bg-muted/50">
      <td colSpan={colSpan} className="py-0 pl-2 pr-3">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? "Expand" : "Collapse"} ${pageTitle}, ${issueCount} ${issueCount === 1 ? "issue" : "issues"}`}
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-sm py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`shrink-0 text-muted-foreground ${collapsed ? "-rotate-90" : ""}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-foreground">
              {pageTitle}
            </p>
            {pagePath && (
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                {pagePath}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-xs">
            {criticalCount > 0 && (
              <span className="font-bold text-severity-critical">
                {criticalCount} critical
              </span>
            )}
            <span className="font-medium text-foreground/70">
              {issueCount} {issueCount === 1 ? "issue" : "issues"}
            </span>
            {propertyName && (
              <span className="hidden text-muted-foreground sm:inline">
                {propertyName}
              </span>
            )}
          </div>
        </button>
      </td>
    </tr>
  );
}

// ── GroupedPageRow ─────────────────────────────────────────────────────────────

interface GroupedPageRowProps {
  violation: HydratedViolation;
  isActive: boolean;
  pageCount: number;
  onRowClick: (id: string) => void;
}

export function GroupedPageRow({
  violation,
  isActive,
  pageCount,
  onRowClick,
}: GroupedPageRowProps) {
  return (
    <tr
      data-issue-id={violation.id}
      onClick={() => onRowClick(violation.id)}
      className={[rowBaseClass, isActive ? rowActiveClass : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <SeverityBadge severity={violation.impact} />
      </td>

      <td className="px-3 py-2.5 align-top text-sm font-normal text-foreground">
        <button
          type="button"
          aria-expanded={isActive}
          aria-controls="issue-details-drawer"
          className={triggerButtonClass}
        >
          <p className="font-medium leading-snug text-foreground underline-offset-4 hover:underline">
            {violation.rule?.help ?? violation.ruleId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {violation.ruleId}
            {pageCount > 1 && (
              <span className="ml-2 text-muted-foreground">
                · {pageCount} pages
              </span>
            )}
          </p>
          <span className="sr-only">, open details</span>
        </button>
      </td>

      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <StatusBadge status={violation.status} />
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-muted-foreground">
        {violation.assignee?.name ?? "—"}
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <PriorityBadge priority={violation.priority} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-sm text-foreground">
        {formatDate(violation.firstSeenAt)}
      </td>
    </tr>
  );
}

// ── GroupedRuleRow ─────────────────────────────────────────────────────────────

interface GroupedRuleRowProps {
  issue: AggregatedIssue;
  isActive: boolean;
  onRowClick: (id: string) => void;
}

export function GroupedRuleRow({
  issue,
  isActive,
  onRowClick,
}: GroupedRuleRowProps) {
  return (
    <tr
      data-issue-id={issue.id}
      onClick={() => onRowClick(issue.id)}
      className={[rowBaseClass, isActive ? rowActiveClass : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <SeverityBadge severity={issue.severity} />
      </td>

      <td className="px-3 py-2.5 align-top text-sm font-normal text-foreground">
        <button
          type="button"
          aria-expanded={isActive}
          aria-controls="issue-details-drawer"
          className={triggerButtonClass}
        >
          <p className="font-medium leading-snug text-foreground underline-offset-4 hover:underline">
            {issue.rule?.help ?? issue.ruleId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {issue.ruleId}
            <span className="ml-2 text-muted-foreground">
              · affects {issue.affectedPagesCount}{" "}
              {issue.affectedPagesCount === 1 ? "page" : "pages"}
            </span>
            <span className="ml-2 text-muted-foreground">
              · {issue.totalInstances} instances
            </span>
            <span className="ml-2 text-muted-foreground">
              ·{" "}
              {issue.affectedPropertiesCount === 1
                ? (issue.affectedProperties[0]?.name ?? "—")
                : `${issue.affectedPropertiesCount} properties`}
            </span>
          </p>
          <span className="sr-only">, open details</span>
        </button>
      </td>

      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <StatusBadge status={issue.status} />
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <PriorityBadge priority={issue.priority} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-sm text-foreground">
        {formatDate(issue.firstSeenAt)}
      </td>
    </tr>
  );
}

// ── FlatViolationRow ───────────────────────────────────────────────────────────

interface FlatViolationRowProps {
  row: Row<HydratedViolation>;
  isActive: boolean;
  isSelected: boolean;
  assignableUsers: User[];
  onRowClick: (id: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
}

export function FlatViolationRow({
  row,
  isActive,
  isSelected,
  assignableUsers,
  onRowClick,
  onToggleSelect,
  onAssign,
}: FlatViolationRowProps) {
  const violation = row.original;
  const currentAssignee = violation.assignee;
  const currentAssigneeIsInactive = currentAssignee && !currentAssignee.isActive;

  return (
    <tr
      data-issue-id={violation.id}
      onClick={() => onRowClick(violation.id)}
      className={[
        rowBaseClass,
        isActive ? rowActiveClass : "",
        isSelected && !isActive ? rowSelectedClass : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Checkbox cell — stops propagation so it doesn't open the drawer */}
      <td
        className="w-10 px-3 py-2.5 align-top"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(violation.id, e.target.checked)}
          aria-label={`Select ${violation.rule?.help ?? violation.ruleId}`}
          className="rounded border-input outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </td>

      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "rule") {
          return (
            <td
              key={cell.id}
              className="px-3 py-2.5 align-top text-sm font-normal text-foreground"
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls="issue-details-drawer"
                className={triggerButtonClass}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                <span className="sr-only">, open details</span>
              </button>
            </td>
          );
        }

        if (cell.column.id === "assignee") {
          return (
            <td
              key={cell.id}
              className="px-3 py-2.5 align-top text-sm text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={violation.assigneeId ?? ""}
                onChange={(e) => onAssign(violation.id, e.target.value || null)}
                aria-label={`Assign ${violation.rule?.help ?? violation.ruleId}`}
                className={assignSelectClass}
              >
                <option value="">Unassigned</option>
                {currentAssigneeIsInactive && (
                  <option value={currentAssignee.id} disabled>
                    {currentAssignee.name} (inactive)
                  </option>
                )}
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </td>
          );
        }

        return (
          <td
            key={cell.id}
            className="px-3 py-2.5 align-top text-sm text-foreground"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
