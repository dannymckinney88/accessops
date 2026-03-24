"use client";

import { useState, useMemo, useEffect } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type { Severity, RemediationStatus } from "@/types/domain";

// MVP: current user lives here until auth replaces it with a real session.
// Move to src/lib/data/index.ts when auth is added.
const CURRENT_ASSIGNEE = "Alex Rivera";

export type QuickFilterChip =
  | "my-issues"
  | "unresolved"
  | "needs-attention";

export type IssueFilters = {
  severity: Severity[];
  status: RemediationStatus[];
  propertyId: string | null;
  search: string; // raw input value — drives the controlled input
  quickFilter: QuickFilterChip | null;
};

const defaultFilters: IssueFilters = {
  severity: [],
  status: [],
  propertyId: null,
  search: "",
  quickFilter: null,
};

const toggle = <T,>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

export const useIssueFilters = (violations: HydratedViolation[]) => {
  const [filters, setFilters] = useState<IssueFilters>(defaultFilters);
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

  const toggleStatus = (s: RemediationStatus) =>
    setFilters((f) => ({ ...f, status: toggle(f.status, s) }));

  const setPropertyId = (id: string | null) =>
    setFilters((f) => ({ ...f, propertyId: id }));

  const setSearch = (q: string) =>
    setFilters((f) => ({ ...f, search: q }));

  const setQuickFilter = (chip: QuickFilterChip | null) =>
    setFilters((f) => ({
      ...f,
      quickFilter: f.quickFilter === chip ? null : chip,
    }));

  const reset = () => {
    setFilters(defaultFilters);
    setDebouncedSearch("");
  };

  // Only true when filtering is actually active. Search only counts at 2+ chars.
  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.propertyId !== null ||
    filters.quickFilter !== null ||
    activeSearch !== "";

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (filters.severity.length > 0 && !filters.severity.includes(v.impact)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(v.status)) {
        return false;
      }
      if (filters.propertyId !== null && v.property?.id !== filters.propertyId) {
        return false;
      }
      if (activeSearch !== "") {
        const q = activeSearch.toLowerCase();
        const matchesRule = v.rule?.help.toLowerCase().includes(q) ?? false;
        const matchesPage = v.page?.title.toLowerCase().includes(q) ?? false;
        const matchesProperty = v.property?.name.toLowerCase().includes(q) ?? false;
        if (!matchesRule && !matchesPage && !matchesProperty) return false;
      }
      if (filters.quickFilter === "my-issues") {
        if (v.assignedTo !== CURRENT_ASSIGNEE) return false;
      }
      if (filters.quickFilter === "unresolved") {
        if (v.status === "resolved") return false;
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
    toggleStatus,
    setPropertyId,
    setSearch,
    setQuickFilter,
    reset,
  };
};
