"use client";

import { useState, useMemo, useEffect } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";

// MVP: current user lives here until auth replaces it with a real session.
// Move to src/lib/data/index.ts when auth is added.
const CURRENT_ASSIGNEE = "Alex Rivera";

export type QuickFilterChip = "my-issues" | "unfixed" | "needs-attention";

export type IssueFilters = {
  severity: Severity[];
  status: RemediationStatus[];
  propertyId: string | null;
  pageId: string | null;
  ruleId: string | null;
  search: string; // raw input value — drives the controlled input
  quickFilter: QuickFilterChip | null;
};

// The Issues page is a remediation workspace, not an audit ledger.
// Default to the unfixed view so users land on active work, not the full history.
// "All" is an explicit opt-in available via the chip.
const defaultFilters: IssueFilters = {
  severity: [],
  status: [],
  propertyId: null,
  pageId: null,
  ruleId: null,
  search: "",
  quickFilter: "unfixed",
};

const toggle = <T>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

export const useIssueFilters = (
  violations: HydratedViolation[],
  initialFilters?: Pick<IssueFilters, "propertyId" | "pageId">,
) => {
  const [filters, setFilters] = useState<IssueFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input at 300ms; minimum 2 chars to activate.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  // The term that is actually filtering. Empty string means no search active.
  const activeSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

  const toggleSeverity = (s: Severity) =>
    setFilters((f) => ({ ...f, severity: toggle(f.severity, s) }));

  const setPropertyId = (id: string | null) =>
    // Reset page filter when property changes — selected page may not exist in new property
    setFilters((f) => ({ ...f, propertyId: id, pageId: null }));

  const setPageId = (id: string | null) =>
    setFilters((f) => ({ ...f, pageId: id }));

  const setRuleId = (id: string | null) =>
    setFilters((f) => ({ ...f, ruleId: id }));

  // Selecting an explicit status replaces quick-filter semantics.
  // Clearing it (null) restores whatever quickFilter was already active.
  const setStatus = (id: RemediationStatus | null) =>
    setFilters((f) => ({
      ...f,
      status: id ? [id] : [],
      quickFilter: id ? null : f.quickFilter,
    }));

  const setSearch = (q: string) => setFilters((f) => ({ ...f, search: q }));

  const setQuickFilter = (chip: QuickFilterChip | null) =>
    setFilters((f) => ({
      ...f,
      quickFilter: f.quickFilter === chip ? null : chip,
    }));

  // reset: returns to the default unfixed view. Used by "Clear all filters".
  const reset = () => {
    setFilters(defaultFilters);
    setDebouncedSearch("");
  };

  // setAll: shows all violations with no filtering. Used by the "All" quick filter chip.
  // Distinct from reset() so "All" is an explicit opt-in, not a default.
  const setAll = () => {
    setFilters({ ...defaultFilters, quickFilter: null });
    setDebouncedSearch("");
  };

  // hasActiveFilters: true when the view differs from the default (unfixed, no other filters).
  // The unfixed chip alone is the default — it does not count as a user-applied filter.
  // This controls whether the filter summary and "Clear all filters" button are visible.
  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.propertyId !== null ||
    filters.pageId !== null ||
    filters.ruleId !== null ||
    filters.quickFilter !== "unfixed" ||
    activeSearch !== "";

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (filters.severity.length > 0 && !filters.severity.includes(v.impact)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(v.status)) {
        return false;
      }
      if (
        filters.propertyId !== null &&
        v.property?.id !== filters.propertyId
      ) {
        return false;
      }
      if (filters.pageId !== null && v.page?.id !== filters.pageId) {
        return false;
      }
      if (filters.ruleId !== null && v.ruleId !== filters.ruleId) {
        return false;
      }
      if (activeSearch !== "") {
        const q = activeSearch.toLowerCase();
        const matchesRule = v.rule?.help.toLowerCase().includes(q) ?? false;
        const matchesPage = v.page?.title.toLowerCase().includes(q) ?? false;
        const matchesProperty =
          v.property?.name.toLowerCase().includes(q) ?? false;
        if (!matchesRule && !matchesPage && !matchesProperty) return false;
      }
      if (filters.quickFilter === "my-issues") {
        if (v.assignedTo !== CURRENT_ASSIGNEE) return false;
      }
      if (filters.quickFilter === "unfixed") {
        if (v.status !== "open" && v.status !== "in-progress") return false;
      }
      if (filters.quickFilter === "needs-attention") {
        const highSeverity = v.impact === "critical" || v.impact === "serious";
        if (!highSeverity || v.status !== "open") return false;
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
    setSearch,
    setQuickFilter,
    setAll,
    reset,
  };
};
