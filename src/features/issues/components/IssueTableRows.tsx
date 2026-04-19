import { flexRender, type Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { HydratedViolation } from "@/lib/data/index";
import type { User } from "@/lib/data/types/domain";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import type { AggregatedIssue } from "../utils/aggregateIssues";
import type { PageGroupData } from "../utils/sortConfig";

// ── Shared row styles ──────────────────────────────────────────────────────────

export const rowBaseClass =
  "border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/70";

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
  "h-7 w-full min-w-24 max-w-[160px] rounded border border-input/60 bg-background px-2 text-xs text-foreground outline-none transition-colors hover:border-interactive-border-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-1";

// ── Interaction model ──────────────────────────────────────────────────────────
//
//   • <tr onClick> catches all mouse clicks (full-row activation)
//   • <button> inside a plain <td> is the sole keyboard / AT entry point
//   • Button has no onClick — Enter/Space fire a click that bubbles to <tr>
//   • Button accessible name = visible rule text + sr-only ", open details"
//   • Checkbox <td> and assignee <td> stop propagation to prevent drawer open

// ── PageGroupHeader ────────────────────────────────────────────────────────────

interface PageGroupSelectionProps {
  allSelected: boolean;
  someSelected: boolean;
  groupViolationCount: number;
  onSelectGroup: (checked: boolean) => void;
}

interface PageGroupHeaderProps {
  pageTitle: string;
  pagePath: string;
  propertyName: string;
  issueCount: number;
  criticalCount: number;
  collapsed: boolean;
  colSpan: number;
  onToggle: () => void;
  selectionProps?: PageGroupSelectionProps;
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
  selectionProps,
}: PageGroupHeaderProps) {
  return (
    <tr className="bg-muted">
      {selectionProps && (
        <td className="w-10 px-3 py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectionProps.allSelected}
            ref={(el) => {
              if (el) el.indeterminate = selectionProps.someSelected && !selectionProps.allSelected;
            }}
            onChange={(e) => selectionProps.onSelectGroup(e.target.checked)}
            aria-label={`Select all issues on ${pageTitle} (${selectionProps.groupViolationCount})`}
            className="rounded border-input outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </td>
      )}
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
            {/* span[block] not p — these are inside a <button> */}
            <span className="block text-sm font-bold leading-snug text-foreground">
              {pageTitle}
            </span>
            {pagePath && (
              <span className="block mt-0.5 text-xs font-normal text-muted-foreground">
                {pagePath}
              </span>
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
  isSelected: boolean;
  pageCount: number;
  assignableUsers: User[];
  onRowClick: (id: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
}

export function GroupedPageRow({
  violation,
  isActive,
  isSelected,
  pageCount,
  assignableUsers,
  onRowClick,
  onToggleSelect,
  onAssign,
}: GroupedPageRowProps) {
  const currentAssignee = violation.assignee;
  const currentAssigneeIsInactive = currentAssignee && !currentAssignee.isActive;
  return (
    <tr
      data-issue-id={violation.id}
      onClick={() => onRowClick(violation.id)}
      className={[
        rowBaseClass,
        "group",
        isActive ? rowActiveClass : "",
        isSelected && !isActive ? rowSelectedClass : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Checkbox cell — stops propagation so it doesn't open the drawer */}
      <td className="w-10 px-3 py-2.5 align-top" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(violation.id, e.target.checked)}
          aria-label={`Select ${violation.rule?.help ?? violation.ruleId}`}
          className="rounded border-input outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </td>
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
          {/* span[block] not p — <p> inside <button> is invalid HTML */}
          <span className="block font-medium leading-snug text-foreground underline-offset-4 group-hover:underline">
            {violation.rule?.help ?? violation.ruleId}
          </span>
          <span className="block mt-0.5 text-xs text-muted-foreground">
            {violation.ruleId}
            {pageCount > 1 && (
              <span className="ml-2 text-muted-foreground">
                · {pageCount} pages
              </span>
            )}
          </span>
          <span className="sr-only">, open details</span>
        </button>
      </td>

      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <StatusBadge status={violation.status} />
      </td>
      <td className="px-3 py-2.5 align-top text-sm text-foreground" onClick={(e) => e.stopPropagation()}>
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
      <td className="px-3 py-2.5 align-top text-sm text-foreground">
        <PriorityBadge priority={violation.priority} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 align-top text-sm text-foreground">
        {formatDate(violation.firstSeenAt)}
      </td>
      {/* Trailing action indicator — aria-hidden; interaction is announced via the button's sr-only text */}
      <td aria-hidden="true" className="w-8 pr-3 py-2.5 align-top text-right">
        <ChevronRight
          size={14}
          aria-hidden="true"
          className="inline-block text-muted-foreground/35 transition-colors group-hover:text-muted-foreground/75 group-focus-within:text-muted-foreground/60"
        />
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
          {/* span[block] not p — <p> inside <button> is invalid HTML */}
          <span className="block font-medium leading-snug text-foreground underline-offset-4 hover:underline">
            {issue.rule?.help ?? issue.ruleId}
          </span>
          <span className="block mt-0.5 text-xs text-muted-foreground">
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
          </span>
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
  const currentAssigneeIsInactive =
    currentAssignee && !currentAssignee.isActive;

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

// ── Table bodies (one per view mode) ──────────────────────────────────────────

// GroupedPageBody ──────────────────────────────────────────────────────────────

interface GroupedPageBodyProps {
  pageGroups: PageGroupData[];
  collapsedGroups: Set<string>;
  selectedIds: Set<string>;
  visibleHeaderCount: number;
  activeViolationId: string | null;
  assignableUsers: User[];
  rulePageCounts: Map<string, number>;
  onViolationRowClick: (id: string) => void;
  onToggleGroup: (groupId: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onGroupSelect: (groupIds: string[], checked: boolean) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
}

export function GroupedPageBody({
  pageGroups,
  collapsedGroups,
  selectedIds,
  visibleHeaderCount,
  activeViolationId,
  assignableUsers,
  rulePageCounts,
  onViolationRowClick,
  onToggleGroup,
  onToggleSelect,
  onGroupSelect,
  onAssign,
}: GroupedPageBodyProps) {
  return (
    <>
      {pageGroups.map((group, index) => {
        const collapsed = collapsedGroups.has(group.pageId);
        const groupIds = group.violations.map((v) => v.id);
        const groupAllSelected = groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));
        const groupSomeSelected = groupIds.some((id) => selectedIds.has(id));
        return (
          <tbody
            key={group.pageId}
            className={index > 0 ? "border-t-4 border-border/50" : "border-t border-border/30"}
          >
            <PageGroupHeader
              pageTitle={group.pageTitle}
              pagePath={group.pagePath}
              propertyName={group.propertyName}
              issueCount={group.violations.length}
              criticalCount={group.criticalCount}
              collapsed={collapsed}
              colSpan={visibleHeaderCount}
              onToggle={() => onToggleGroup(group.pageId)}
              selectionProps={{
                allSelected: groupAllSelected,
                someSelected: groupSomeSelected,
                groupViolationCount: group.violations.length,
                onSelectGroup: (checked) => onGroupSelect(groupIds, checked),
              }}
            />
            {!collapsed &&
              group.violations.map((violation) => (
                <GroupedPageRow
                  key={violation.id}
                  violation={violation}
                  isActive={violation.id === activeViolationId}
                  isSelected={selectedIds.has(violation.id)}
                  pageCount={rulePageCounts.get(violation.ruleId) ?? 1}
                  assignableUsers={assignableUsers}
                  onRowClick={onViolationRowClick}
                  onToggleSelect={onToggleSelect}
                  onAssign={onAssign}
                />
              ))}
          </tbody>
        );
      })}
    </>
  );
}

// GroupedRuleBody ──────────────────────────────────────────────────────────────

interface GroupedRuleBodyProps {
  issues: AggregatedIssue[];
  activeGroupId: string | null;
  onRowClick: (id: string) => void;
}

export function GroupedRuleBody({ issues, activeGroupId, onRowClick }: GroupedRuleBodyProps) {
  return (
    <tbody>
      {issues.map((issue) => (
        <GroupedRuleRow
          key={issue.id}
          issue={issue}
          isActive={issue.id === activeGroupId}
          onRowClick={onRowClick}
        />
      ))}
    </tbody>
  );
}

// FlatBody ─────────────────────────────────────────────────────────────────────

interface FlatBodyProps {
  rows: Row<HydratedViolation>[];
  selectedIds: Set<string>;
  activeViolationId: string | null;
  assignableUsers: User[];
  onRowClick: (id: string) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
}

export function FlatBody({
  rows,
  selectedIds,
  activeViolationId,
  assignableUsers,
  onRowClick,
  onToggleSelect,
  onAssign,
}: FlatBodyProps) {
  return (
    <tbody>
      {rows.map((row) => (
        <FlatViolationRow
          key={row.id}
          row={row}
          isActive={row.original.id === activeViolationId}
          isSelected={selectedIds.has(row.original.id)}
          assignableUsers={assignableUsers}
          onRowClick={onRowClick}
          onToggleSelect={onToggleSelect}
          onAssign={onAssign}
        />
      ))}
    </tbody>
  );
}
