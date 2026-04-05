"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HydratedViolation, Property } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { aggregateIssues } from "../utils/aggregateIssues";
import {
  applyOverrides,
  persistOverride,
  persistOverrides,
} from "../utils/issueOverrides";
import IssueFilterBar, {
  type AvailablePage,
  type AvailableRule,
  type IssueViewMode,
} from "./IssueFilterBar";
import IssueDrawer from "./IssueDrawer";
import IssuesTable from "./IssuesTable";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from server props only — no localStorage access here so the first
  // client render matches the server render exactly.  Overrides are applied after
  // mount in the effect below, where localStorage is guaranteed to be available.
  const [violations, setViolations] = useState<HydratedViolation[]>(initialViolations);

  const assignableUsers = useMemo(
    () => users.filter((u) => u.isActive),
    [users],
  );

  const activeViolationId = searchParams.get("issueId") ?? null;
  const activeGroupId = searchParams.get("groupId") ?? null;
  const [viewMode, setViewMode] = useState<IssueViewMode>(() => {
    const v = searchParams.get("view");
    return v === "grouped-page" || v === "grouped-rule" ? v : "flat";
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRowIdRef = useRef<string | null>(null);

  // Apply any localStorage overrides once, after mount.  applyOverrides returns
  // the same reference when the override map is empty, so React bails out with
  // no re-render in the common case of a fresh session.
  useEffect(() => {
    setViolations(applyOverrides(initialViolations, users));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const openViolationDrawer = (id: string) => {
    triggerRowIdRef.current = id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("issueId", id);
    params.delete("groupId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openGroupedIssueDrawer = (id: string) => {
    triggerRowIdRef.current = id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("groupId", id);
    params.delete("issueId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("issueId");
    params.delete("groupId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const focusTriggerRow = () => {
    const id = triggerRowIdRef.current;

    if (id) {
      const trigger = document.querySelector<HTMLElement>(
        `[data-issue-id="${id}"] button`,
      );

      if (trigger) {
        requestAnimationFrame(() => {
          trigger.focus();
          triggerRowIdRef.current = null;
        });
        return true;
      }
    }

    const firstTrigger = document.querySelector<HTMLElement>(
      "[data-issues-table] [data-issue-id] button",
    );

    if (firstTrigger) {
      requestAnimationFrame(() => {
        firstTrigger.focus();
        triggerRowIdRef.current = null;
      });
      return true;
    }

    if (headingRef.current) {
      requestAnimationFrame(() => {
        headingRef.current?.focus();
        triggerRowIdRef.current = null;
      });
      return true;
    }

    triggerRowIdRef.current = null;
    return false;
  };

  const handleAssign = (id: string, assigneeId: string | null) => {
    persistOverride(id, { assigneeId });
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const assignee = assigneeId
          ? (users.find((u) => u.id === assigneeId) ?? undefined)
          : undefined;
        return { ...v, assigneeId: assigneeId ?? undefined, assignee };
      }),
    );
  };

  const handleBulkAssign = (ids: string[], assigneeId: string | null) => {
    persistOverrides(ids, { assigneeId });
    const idSet = new Set(ids);
    setViolations((prev) =>
      prev.map((v) => {
        if (!idSet.has(v.id)) return v;
        const assignee = assigneeId
          ? (users.find((u) => u.id === assigneeId) ?? undefined)
          : undefined;
        return { ...v, assigneeId: assigneeId ?? undefined, assignee };
      }),
    );
  };

  const handleBulkStatus = (ids: string[], status: RemediationStatus) => {
    const idSet = new Set(ids);
    // Only persist for violations that aren't already verified — matches the guard below
    const eligibleIds = violations
      .filter((v) => idSet.has(v.id) && v.status !== "verified")
      .map((v) => v.id);
    persistOverrides(eligibleIds, { status });
    setViolations((prev) =>
      prev.map((v) => {
        if (!idSet.has(v.id)) return v;
        if (v.status === "verified") return v;
        return { ...v, status };
      }),
    );
  };

  const handleUpdateViolation = (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => {
    persistOverride(id, patch);
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v };
        if ("assigneeId" in patch) {
          updated.assigneeId = patch.assigneeId ?? undefined;
          updated.assignee = patch.assigneeId
            ? (users.find((u) => u.id === patch.assigneeId) ?? undefined)
            : undefined;
        }
        if (patch.status !== undefined) {
          updated.status = patch.status;
        }
        return updated;
      }),
    );
  };

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

  // Sync filter state → URL. severity and status are intentionally not URL-synced
  // (they reset to the unfixed default on every page load).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // viewMode — omit "flat" (default) to keep URLs clean
    if (viewMode === "flat") params.delete("view");
    else params.set("view", viewMode);

    // Multi-value array params: delete all then re-append
    params.delete("propertyId");
    filters.propertyIds.forEach((id) => params.append("propertyId", id));
    params.delete("pageId");
    filters.pageIds.forEach((id) => params.append("pageId", id));
    params.delete("ruleId");
    filters.ruleIds.forEach((id) => params.append("ruleId", id));
    params.delete("assigneeId");
    filters.assigneeIds.forEach((id) => params.append("assigneeId", id));

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    const newQs = params.toString();
    if (newQs === searchParams.toString()) return;

    router.replace(newQs ? `${pathname}?${newQs}` : pathname, { scroll: false });
  }, [viewMode, filters.propertyIds.join(","), filters.pageIds.join(","), filters.ruleIds.join(","), filters.assigneeIds.join(","), filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const groupedIssues = useMemo(
    () => aggregateIssues(filteredViolations),
    [filteredViolations],
  );

  const activeViolation =
    activeViolationId !== null
      ? (violations.find((v) => v.id === activeViolationId) ?? null)
      : null;

  const activeGroupedIssue =
    activeGroupId !== null
      ? (groupedIssues.find((issue) => issue.id === activeGroupId) ?? null)
      : null;

  const unfixedViolations = violations.filter(
    (v) => v.status === "open" || v.status === "in-progress",
  );
  const criticalUnfixedCount = unfixedViolations.filter(
    (v) => v.impact === "critical",
  ).length;
  const propertyCount = new Set(
    unfixedViolations.map((v) => v.property?.id).filter(Boolean),
  ).size;
  const subtitle =
    criticalUnfixedCount > 0
      ? `${unfixedViolations.length} unfixed issues · ${criticalUnfixedCount} critical · ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`
      : `${unfixedViolations.length} unfixed issues · ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  const availableRules = useMemo<AvailableRule[]>(() => {
    const seen = new Map<string, string>();

    for (const violation of violations) {
      if (!seen.has(violation.ruleId)) {
        seen.set(violation.ruleId, violation.rule?.help ?? violation.ruleId);
      }
    }

    return Array.from(seen.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [violations]);

  const availablePages = useMemo<AvailablePage[]>(() => {
    const seen = new Set<string>();
    const result: AvailablePage[] = [];

    for (const violation of violations) {
      if (
        violation.page &&
        violation.property &&
        !seen.has(violation.page.id)
      ) {
        seen.add(violation.page.id);
        result.push({
          id: violation.page.id,
          title: violation.page.title,
          propertyId: violation.property.id,
          propertyName: violation.property.name,
        });
      }
    }

    return result;
  }, [violations]);

  const rulePageCounts = useMemo(() => {
    const rulePagesMap = new Map<string, Set<string>>();

    for (const violation of violations) {
      if (!violation.page) continue;
      if (!rulePagesMap.has(violation.ruleId)) {
        rulePagesMap.set(violation.ruleId, new Set());
      }
      rulePagesMap.get(violation.ruleId)!.add(violation.page.id);
    }

    const counts = new Map<string, number>();
    for (const [ruleId, pages] of rulePagesMap) {
      counts.set(ruleId, pages.size);
    }

    return counts;
  }, [violations]);

  const isEmpty =
    viewMode === "grouped-rule"
      ? groupedIssues.length === 0
      : filteredViolations.length === 0;

  const summaryText =
    viewMode === "grouped-rule"
      ? `Showing ${groupedIssues.length} grouped issues from ${filteredViolations.length} issue instances`
      : viewMode === "grouped-page"
        ? `Showing ${filteredViolations.length} issues grouped by page`
        : `Showing ${filteredViolations.length} of ${violations.length} issues`;

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
