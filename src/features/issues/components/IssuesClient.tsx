"use client";

import { useRef, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { HydratedViolation, Property } from "@/lib/data/index";
import { useIssueFilters } from "../hooks/useIssueFilters";
import IssueFilterBar, { type AvailablePage } from "./IssueFilterBar";
import IssuesTable from "./IssuesTable";
import IssueDrawer from "./IssueDrawer";

interface IssuesClientProps {
  violations: HydratedViolation[];
  properties: Property[];
}

const IssuesClient = ({ violations, properties }: IssuesClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeViolationId = searchParams.get("issueId") ?? null;

  // Tracks the violation ID whose row triggered the drawer open.
  // Used to restore focus to that row when the drawer closes.
  const triggerRowIdRef = useRef<string | null>(null);

  const openDrawer = (id: string) => {
    triggerRowIdRef.current = id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("issueId", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Replace instead of push: closing the drawer shouldn't pollute browser history.
  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("issueId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Called by IssueDrawer's onCloseAutoFocus to restore focus to the trigger row.
  // Falls back to the first visible row if the original row is no longer in the DOM
  // (e.g. filters changed while the drawer was open).
  // requestAnimationFrame defers focus until after the Sheet close animation settles.
  const focusTriggerRow = () => {
    const id = triggerRowIdRef.current;

    if (id) {
      const row = document.querySelector<HTMLElement>(
        `[data-violation-id="${id}"]`,
      );
      if (row) {
        requestAnimationFrame(() => {
          row.focus();
          triggerRowIdRef.current = null;
        });
        return;
      }
    }

    // Fallback: scoped to the issues table region to avoid collisions with
    // any future tables elsewhere in the layout.
    const firstRow = document.querySelector<HTMLElement>(
      "[data-issues-table] [data-violation-id]",
    );
    requestAnimationFrame(() => {
      firstRow?.focus();
      triggerRowIdRef.current = null;
    });
  };

  const {
    filters,
    filteredViolations,
    hasActiveFilters,
    activeSearch,
    toggleSeverity,
    setPropertyId,
    setPageId,
    setSearch,
    setQuickFilter,
    setAll,
    reset,
  } = useIssueFilters(violations);

  const activeViolation =
    activeViolationId !== null
      ? (violations.find((v) => v.id === activeViolationId) ?? null)
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

  // Derive unique pages from violations for the page filter dropdown.
  const availablePages = useMemo<AvailablePage[]>(() => {
    const seen = new Set<string>();
    const result: AvailablePage[] = [];
    for (const v of violations) {
      if (v.page && v.property && !seen.has(v.page.id)) {
        seen.add(v.page.id);
        result.push({
          id: v.page.id,
          title: v.page.title,
          propertyId: v.property.id,
          propertyName: v.property.name,
        });
      }
    }
    return result;
  }, [violations]);

  // Count distinct pages per rule across all violations (not just filtered).
  // Used to surface "appears on N pages" hints in the table and drawer.
  const rulePageCounts = useMemo<Map<string, number>>(() => {
    const rulePagesMap = new Map<string, Set<string>>();
    for (const v of violations) {
      if (!v.page) continue;
      if (!rulePagesMap.has(v.ruleId)) {
        rulePagesMap.set(v.ruleId, new Set());
      }
      rulePagesMap.get(v.ruleId)!.add(v.page.id);
    }
    const counts = new Map<string, number>();
    for (const [ruleId, pages] of rulePagesMap) {
      counts.set(ruleId, pages.size);
    }
    return counts;
  }, [violations]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <IssueFilterBar
        filters={filters}
        properties={properties}
        availablePages={availablePages}
        totalCount={violations.length}
        filteredCount={filteredViolations.length}
        hasActiveFilters={hasActiveFilters}
        activeSearch={activeSearch}
        onToggleSeverity={toggleSeverity}
        onSetPropertyId={setPropertyId}
        onSetPageId={setPageId}
        onSetSearch={setSearch}
        onSetQuickFilter={setQuickFilter}
        onSetAll={setAll}
        onReset={reset}
      />

      {filteredViolations.length === 0 ? (
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
              className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <IssuesTable
          violations={filteredViolations}
          activeViolationId={activeViolationId}
          rulePageCounts={rulePageCounts}
          onRowClick={openDrawer}
        />
      )}

      <IssueDrawer
        violation={activeViolation}
        rulePageCount={
          activeViolation ? (rulePageCounts.get(activeViolation.ruleId) ?? 1) : undefined
        }
        onClose={closeDrawer}
        onFocusTrigger={focusTriggerRow}
      />
    </div>
  );
};

export default IssuesClient;
