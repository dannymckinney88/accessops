"use client";

import { useState, useMemo, useEffect } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";

export type IssueFilters = {
  severity: Severity[];
  status: RemediationStatus[];
  propertyIds: string[];
  pageIds: string[];
  ruleIds: string[];
  assigneeIds: string[]; // "unassigned" is a valid sentinel for issues with no assignee
  search: string;
};

// No default filters — the Issues screen opens unfiltered.
// Active work is surfaced through default table sort order (status asc: open → in-progress first),
// not through implicit filter state.
export const defaultIssueFilters: IssueFilters = {
  severity: [],
  status: [],
  propertyIds: [],
  pageIds: [],
  ruleIds: [],
  assigneeIds: [],
  search: "",
};

const toggle = <T,>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

export const useIssueFilters = (
  violations: HydratedViolation[],
  initialFilters?: Partial<
    Pick<
      IssueFilters,
      "propertyIds" | "pageIds" | "ruleIds" | "assigneeIds" | "search"
    >
  >,
) => {
  const [filters, setFilters] = useState<IssueFilters>({
    ...defaultIssueFilters,
    ...initialFilters,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const activeSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

  // Derive page→property ownership from violations so togglePropertyId can
  // remove only invalid page selections instead of clearing all pages blindly.
  const pageOwnership = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of violations) {
      if (v.page && v.property) map.set(v.page.id, v.property.id);
    }
    return map;
  }, [violations]);

  // Toggle functions (multi-select) for UI controls
  const toggleSeverity = (s: Severity) =>
    setFilters((f) => ({ ...f, severity: toggle(f.severity, s) }));

  const toggleStatus = (s: RemediationStatus) =>
    setFilters((f) => ({ ...f, status: toggle(f.status, s) }));

  const togglePropertyId = (id: string) =>
    setFilters((f) => {
      const newPropertyIds = toggle(f.propertyIds, id);
      // When no properties are selected, all pages are valid — preserve them.
      // Otherwise, retain only pages that belong to one of the selected properties.
      const newPageIds =
        newPropertyIds.length === 0
          ? f.pageIds
          : f.pageIds.filter((pageId) => {
              const ownerPropertyId = pageOwnership.get(pageId);
              return (
                ownerPropertyId !== undefined &&
                newPropertyIds.includes(ownerPropertyId)
              );
            });
      return { ...f, propertyIds: newPropertyIds, pageIds: newPageIds };
    });

  const togglePageId = (id: string) =>
    setFilters((f) => ({ ...f, pageIds: toggle(f.pageIds, id) }));

  const toggleRuleId = (id: string) =>
    setFilters((f) => ({ ...f, ruleIds: toggle(f.ruleIds, id) }));

  const toggleAssigneeId = (id: string) =>
    setFilters((f) => ({ ...f, assigneeIds: toggle(f.assigneeIds, id) }));

  // Single-value setters — used for programmatic control (e.g. drawer "View all instances")
  const setPropertyId = (id: string | null) =>
    setFilters((f) => ({ ...f, propertyIds: id ? [id] : [], pageIds: [] }));

  const setPageId = (id: string | null) =>
    setFilters((f) => ({ ...f, pageIds: id ? [id] : [] }));

  const setRuleId = (id: string | null) =>
    setFilters((f) => ({ ...f, ruleIds: id ? [id] : [] }));

  const setStatus = (id: RemediationStatus | null) =>
    setFilters((f) => ({ ...f, status: id ? [id] : [] }));

  const setAssigneeId = (id: string | null) =>
    setFilters((f) => ({ ...f, assigneeIds: id ? [id] : [] }));

  const setSearch = (q: string) => setFilters((f) => ({ ...f, search: q }));

  // Dimension-level clears — reset one filter group without touching others
  const clearSeverity = () => setFilters((f) => ({ ...f, severity: [] }));
  const clearStatus = () => setFilters((f) => ({ ...f, status: [] }));
  const clearPropertyIds = () =>
    setFilters((f) => ({ ...f, propertyIds: [], pageIds: [] }));
  const clearPageIds = () => setFilters((f) => ({ ...f, pageIds: [] }));
  const clearRuleIds = () => setFilters((f) => ({ ...f, ruleIds: [] }));
  const clearAssigneeIds = () => setFilters((f) => ({ ...f, assigneeIds: [] }));

  const reset = () => {
    setFilters(defaultIssueFilters);
    setDebouncedSearch("");
  };

  // Any non-empty selection deviates from the unfiltered default.
  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.propertyIds.length > 0 ||
    filters.pageIds.length > 0 ||
    filters.ruleIds.length > 0 ||
    filters.assigneeIds.length > 0 ||
    activeSearch !== "";

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (
        filters.severity.length > 0 &&
        !filters.severity.includes(v.impact)
      ) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(v.status)) {
        return false;
      }
      if (
        filters.propertyIds.length > 0 &&
        !filters.propertyIds.includes(v.property?.id ?? "")
      ) {
        return false;
      }
      if (
        filters.pageIds.length > 0 &&
        !filters.pageIds.includes(v.page?.id ?? "")
      ) {
        return false;
      }
      if (
        filters.ruleIds.length > 0 &&
        !filters.ruleIds.includes(v.ruleId)
      ) {
        return false;
      }
      if (filters.assigneeIds.length > 0) {
        const matchesUnassigned =
          filters.assigneeIds.includes("unassigned") && !v.assigneeId;
        const matchesUser = filters.assigneeIds.some(
          (id) => id !== "unassigned" && id === v.assigneeId,
        );
        if (!matchesUnassigned && !matchesUser) return false;
      }
      if (activeSearch !== "") {
        const q = activeSearch.toLowerCase();
        const matchesRule = v.rule?.help.toLowerCase().includes(q) ?? false;
        const matchesPage = v.page?.title.toLowerCase().includes(q) ?? false;
        const matchesProperty =
          v.property?.name.toLowerCase().includes(q) ?? false;
        if (!matchesRule && !matchesPage && !matchesProperty) return false;
      }
      return true;
    });
  }, [violations, filters, activeSearch]);

  return {
    filters,
    filteredViolations,
    hasActiveFilters,
    activeSearch,
    // toggle setters (multi-select UI)
    toggleSeverity,
    toggleStatus,
    togglePropertyId,
    togglePageId,
    toggleRuleId,
    toggleAssigneeId,
    // single-value setters (programmatic use)
    setPropertyId,
    setPageId,
    setRuleId,
    setStatus,
    setAssigneeId,
    setSearch,
    // dimension-level clears
    clearSeverity,
    clearStatus,
    clearPropertyIds,
    clearPageIds,
    clearRuleIds,
    clearAssigneeIds,
    reset,
  };
};
