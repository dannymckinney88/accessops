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

// Default view is the unfixed remediation backlog (open + in-progress).
// "Active filters" means anything that deviates from this default state.
export const defaultIssueFilters: IssueFilters = {
  severity: [],
  status: ["open", "in-progress"],
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
  initialFilters?: Partial<Pick<IssueFilters, "propertyIds" | "pageIds" | "ruleIds" | "assigneeIds" | "search">>,
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

  const toggleSeverity = (s: Severity) =>
    setFilters((f) => ({ ...f, severity: toggle(f.severity, s) }));

  // Single-value setters — store as single-element arrays to preserve the
  // array-based model while the UI remains single-select dropdowns.
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

  const reset = () => {
    setFilters(defaultIssueFilters);
    setDebouncedSearch("");
  };

  // "Active filters" means the user has deviated from the default unfixed view.
  const defaultStatusKey = defaultIssueFilters.status.join(",");
  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.status.join(",") !== defaultStatusKey ||
    filters.propertyIds.length > 0 ||
    filters.pageIds.length > 0 ||
    filters.ruleIds.length > 0 ||
    filters.assigneeIds.length > 0 ||
    activeSearch !== "";

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (filters.severity.length > 0 && !filters.severity.includes(v.impact)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(v.status)) {
        return false;
      }
      if (filters.propertyIds.length > 0 && !filters.propertyIds.includes(v.property?.id ?? "")) {
        return false;
      }
      if (filters.pageIds.length > 0 && !filters.pageIds.includes(v.page?.id ?? "")) {
        return false;
      }
      if (filters.ruleIds.length > 0 && !filters.ruleIds.includes(v.ruleId)) {
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
        const matchesProperty = v.property?.name.toLowerCase().includes(q) ?? false;
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
    toggleSeverity,
    setPropertyId,
    setPageId,
    setRuleId,
    setStatus,
    setAssigneeId,
    setSearch,
    reset,
  };
};
