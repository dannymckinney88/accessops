"use client";

import { useMemo } from "react";
import type { Property } from "@/lib/data/index";
import type { HydratedViolation } from "@/lib/data/index";
import type { User } from "@/lib/data/types/domain";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { useIssueMutations } from "../hooks/useIssueMutations";
import { useIssueDerivedData } from "../hooks/useIssueDerivedData";
import { useIssueWorkspaceState } from "../hooks/useIssueWorkspaceState";
import IssueFilterBar from "./IssueFilterBar";
import ActiveFilterChips from "./ActiveFilterChips";
import IssueDrawer from "./IssueDrawer";
import IssuesTable from "./IssuesTable";
import { useSearchParams } from "next/navigation";

interface IssuesClientProps {
  violations: HydratedViolation[];
  properties: Property[];
  currentUser: User;
  users: User[];
}

const IssuesClient = ({
  violations: initialViolations,
  properties,
  currentUser: _currentUser,
  users,
}: IssuesClientProps) => {
  const searchParams = useSearchParams();

  const assignableUsers = useMemo(
    () => users.filter((u) => u.isActive),
    [users],
  );

  // --- Mutations: violation state + all write operations ---
  const {
    violations,
    handleAssign,
    handleBulkAssign,
    handleBulkStatus,
    handleUpdateViolation,
  } = useIssueMutations(initialViolations, users);

  // --- Filters: multi-select filter state + filtered result set ---
  const {
    filters,
    filteredViolations,
    hasActiveFilters,
    toggleSeverity,
    toggleStatus,
    togglePropertyId,
    togglePageId,
    toggleRuleId,
    toggleAssigneeId,
    setRuleId,
    setSearch,
    clearSeverity,
    clearStatus,
    clearPropertyIds,
    clearPageIds,
    clearRuleIds,
    clearAssigneeIds,
    reset,
  } = useIssueFilters(violations, {
    // Multi-value URL params: getAll returns [] when absent, which is the correct default.
    propertyIds: searchParams.getAll("propertyId"),
    pageIds: searchParams.getAll("pageId"),
    ruleIds: searchParams.getAll("ruleId"),
    assigneeIds: searchParams.getAll("assigneeId"),
    search: searchParams.get("search") ?? "",
  });

  // --- Workspace state: URL params, view mode, drawer helpers, focus ---
  const {
    activeViolationId,
    activeGroupId,
    viewMode,
    setViewMode,
    headingRef,
    openViolationDrawer,
    openGroupedIssueDrawer,
    closeDrawer,
    focusTriggerRow,
  } = useIssueWorkspaceState({ filters });

  // --- Derived data: grouped issues, active records, labels, filter options ---
  const {
    groupedIssues,
    activeViolation,
    activeGroupedIssue,
    subtitle,
    availableRules,
    availablePages,
    rulePageCounts,
    isEmpty,
    summaryText,
  } = useIssueDerivedData({
    violations,
    filteredViolations,
    viewMode,
    activeViolationId,
    activeGroupId,
  });

  const baseClass =
    "h-8 px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-inset";

  const inactiveClass =
    "bg-background text-foreground/80 border-input hover:bg-interactive-hover hover:text-interactive-hover-foreground hover:border-interactive-border-hover active:bg-interactive-active active:text-interactive-active-foreground active:border-interactive-border-active";

  const activeClass =
    "bg-interactive-selected text-interactive-selected-foreground border-interactive-selected-border";

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="border-b pb-4">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          Issues
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Review active page groups by priority, then open any issue row for remediation details.
        </p>
      </div>

      {/* Contained filter panel */}
      <IssueFilterBar
        filters={filters}
        properties={properties}
        assignableUsers={assignableUsers}
        availablePages={availablePages}
        availableRules={availableRules}
        hasActiveFilters={hasActiveFilters}
        onToggleSeverity={toggleSeverity}
        onToggleStatus={toggleStatus}
        onTogglePropertyId={togglePropertyId}
        onTogglePageId={togglePageId}
        onToggleRuleId={toggleRuleId}
        onToggleAssigneeId={toggleAssigneeId}
        onSetSearch={setSearch}
        onClearSeverity={clearSeverity}
        onClearStatus={clearStatus}
        onClearPropertyIds={clearPropertyIds}
        onClearPageIds={clearPageIds}
        onClearRuleIds={clearRuleIds}
        onClearAssigneeIds={clearAssigneeIds}
        onReset={reset}
      />

      <ActiveFilterChips
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        properties={properties}
        assignableUsers={assignableUsers}
        availablePages={availablePages}
        availableRules={availableRules}
        onToggleSeverity={toggleSeverity}
        onToggleStatus={toggleStatus}
        onTogglePropertyId={togglePropertyId}
        onTogglePageId={togglePageId}
        onToggleRuleId={toggleRuleId}
        onToggleAssigneeId={toggleAssigneeId}
        onClearPageIds={clearPageIds}
        onClearRuleIds={clearRuleIds}
        onSetSearch={setSearch}
      />

      {/* Table workspace */}
      <div className="flex flex-col gap-2">
        {/* View mode + results summary */}
        <div className="flex items-center justify-between gap-4">
          <div
            role="group"
            aria-label="View mode"
            className="flex shrink-0 items-center overflow-hidden rounded-md border border-input"
          >
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              aria-pressed={viewMode === "flat"}
              className={`${baseClass} ${
                viewMode === "flat" ? activeClass : inactiveClass
              }`}
            >
              Flat
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grouped-page")}
              aria-pressed={viewMode === "grouped-page"}
              className={`${baseClass} border-l border-input ${
                viewMode === "grouped-page" ? activeClass : inactiveClass
              }`}
            >
              Group by Page
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grouped-rule")}
              aria-pressed={viewMode === "grouped-rule"}
              className={`${baseClass} border-l border-input ${
                viewMode === "grouped-rule" ? activeClass : inactiveClass
              }`}
            >
              Group by Rule
            </button>
          </div>

          {(hasActiveFilters || viewMode !== "flat") && (
            <p role="status" className="text-xs text-muted-foreground">
              {summaryText}
            </p>
          )}
        </div>

        {isEmpty ? (
          <div role="status" className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "No issues match your current filters. Try adjusting the filters above or clear all to start over."
                : "No violations found across all properties."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-3 rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <IssuesTable
            violations={filteredViolations}
            groupedIssues={groupedIssues}
            activeViolationId={activeViolationId}
            activeGroupId={activeGroupId}
            rulePageCounts={rulePageCounts}
            viewMode={viewMode}
            assignableUsers={assignableUsers}
            onViolationRowClick={openViolationDrawer}
            onGroupedIssueRowClick={openGroupedIssueDrawer}
            onAssign={handleAssign}
            onBulkAssign={handleBulkAssign}
            onBulkStatus={handleBulkStatus}
          />
        )}
      </div>

      <IssueDrawer
        viewMode={viewMode}
        violation={activeViolation}
        groupedIssue={activeGroupedIssue}
        assignableUsers={assignableUsers}
        rulePageCount={
          activeViolation
            ? (rulePageCounts.get(activeViolation.ruleId) ?? 1)
            : undefined
        }
        onClose={closeDrawer}
        onFocusTrigger={focusTriggerRow}
        onViewAllInstances={(ruleId) => {
          setRuleId(ruleId);
          setViewMode("flat");
          closeDrawer();
        }}
        onUpdateViolation={handleUpdateViolation}
      />
    </div>
  );
};

export default IssuesClient;
