"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HydratedViolation, Property } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { aggregateIssues } from "../utils/aggregateIssues";
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
  currentUser,
  users,
}: IssuesClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [violations, setViolations] =
    useState<HydratedViolation[]>(initialViolations);

  const assignableUsers = useMemo(
    () => users.filter((u) => u.isActive),
    [users],
  );

  const activeViolationId = searchParams.get("issueId") ?? null;
  const activeGroupId = searchParams.get("groupId") ?? null;
  const [viewMode, setViewMode] = useState<IssueViewMode>("flat");

  const initialPropertyId = searchParams.get("propertyId") ?? null;
  const initialPageId = searchParams.get("pageId") ?? null;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRowIdRef = useRef<string | null>(null);

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
    activeSearch,
    toggleSeverity,
    setPropertyId,
    setPageId,
    setRuleId,
    setStatus,
    setAssigneeId,
    setSearch,
    setQuickFilter,
    setAll,
    reset,
  } = useIssueFilters(violations, currentUser.id, {
    propertyId: initialPropertyId,
    pageId: initialPageId,
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlProp = params.get("propertyId") ?? null;
    const urlPage = params.get("pageId") ?? null;

    if (urlProp === filters.propertyId && urlPage === filters.pageId) return;

    if (filters.propertyId) params.set("propertyId", filters.propertyId);
    else params.delete("propertyId");

    if (filters.pageId) params.set("pageId", filters.pageId);
    else params.delete("pageId");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters.propertyId, filters.pageId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const ruleLabel = filters.ruleId
    ? (violations.find((v) => v.ruleId === filters.ruleId)?.rule?.help ??
      filters.ruleId)
    : null;

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

  const baseClass =
    "h-8 px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-inset";

  const inactiveClass =
    "bg-background text-foreground/80 border-input hover:bg-interactive-hover hover:text-interactive-hover-foreground hover:border-interactive-border-hover active:bg-interactive-active active:text-interactive-active-foreground active:border-interactive-border-active";

  const activeClass =
    "bg-interactive-selected text-interactive-selected-foreground border-interactive-selected-border";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight outline-none"
          >
            Issues
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

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
      </div>

      <IssueFilterBar
        filters={filters}
        properties={properties}
        assignableUsers={assignableUsers}
        availablePages={availablePages}
        availableRules={availableRules}
        ruleLabel={ruleLabel}
        totalCount={violations.length}
        filteredCount={filteredViolations.length}
        groupedCount={
          viewMode === "grouped-rule" ? groupedIssues.length : undefined
        }
        hasActiveFilters={hasActiveFilters}
        activeSearch={activeSearch}
        viewMode={viewMode}
        onToggleSeverity={toggleSeverity}
        onSetPropertyId={setPropertyId}
        onSetPageId={setPageId}
        onSetRuleId={setRuleId}
        onSetStatus={setStatus}
        onSetAssigneeId={setAssigneeId}
        onSetSearch={setSearch}
        onSetQuickFilter={setQuickFilter}
        onSetAll={setAll}
        onReset={reset}
      />

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
