"use client";

import { useState, useMemo, useEffect } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type { Severity, RemediationStatus } from "@/lib/data/types/domain";

export type QuickFilterChip = "my-issues" | "unfixed" | "needs-attention";

export type IssueFilters = {
  severity: Severity[];
  status: RemediationStatus[];
  propertyId: string | null;
  pageId: string | null;
  ruleId: string | null;
  assigneeId: string | null; // null = all, "unassigned" = no assignee, userId = specific user
  search: string;
  quickFilter: QuickFilterChip | null;
};

const defaultFilters: IssueFilters = {
  severity: [],
  status: [],
  propertyId: null,
  pageId: null,
  ruleId: null,
  assigneeId: null,
  search: "",
  quickFilter: "unfixed",
};

const toggle = <T,>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

export const useIssueFilters = (
  violations: HydratedViolation[],
  currentUserId: string,
  initialFilters?: Pick<IssueFilters, "propertyId" | "pageId">,
) => {
  const [filters, setFilters] = useState<IssueFilters>({
    ...defaultFilters,
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

  const setPropertyId = (id: string | null) =>
    setFilters((f) => ({ ...f, propertyId: id, pageId: null }));

  const setPageId = (id: string | null) =>
    setFilters((f) => ({ ...f, pageId: id }));

  const setRuleId = (id: string | null) =>
    setFilters((f) => ({ ...f, ruleId: id }));

  const setStatus = (id: RemediationStatus | null) =>
    setFilters((f) => ({
      ...f,
      status: id ? [id] : [],
      quickFilter: id ? null : f.quickFilter,
    }));

  const setAssigneeId = (id: string | null) =>
    setFilters((f) => ({ ...f, assigneeId: id }));

  const setSearch = (q: string) => setFilters((f) => ({ ...f, search: q }));

  const setQuickFilter = (chip: QuickFilterChip | null) =>
    setFilters((f) => ({
      ...f,
      quickFilter: f.quickFilter === chip ? null : chip,
    }));

  const reset = () => {
    setFilters(defaultFilters);
    setDebouncedSearch("");
  };

  const setAll = () => {
    setFilters({ ...defaultFilters, quickFilter: null });
    setDebouncedSearch("");
  };

  const hasActiveFilters =
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.propertyId !== null ||
    filters.pageId !== null ||
    filters.ruleId !== null ||
    filters.assigneeId !== null ||
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
      if (filters.propertyId !== null && v.property?.id !== filters.propertyId) {
        return false;
      }
      if (filters.pageId !== null && v.page?.id !== filters.pageId) {
        return false;
      }
      if (filters.ruleId !== null && v.ruleId !== filters.ruleId) {
        return false;
      }
      if (filters.assigneeId !== null) {
        if (filters.assigneeId === "unassigned") {
          if (v.assigneeId) return false;
        } else {
          if (v.assigneeId !== filters.assigneeId) return false;
        }
      }
      if (activeSearch !== "") {
        const q = activeSearch.toLowerCase();
        const matchesRule = v.rule?.help.toLowerCase().includes(q) ?? false;
        const matchesPage = v.page?.title.toLowerCase().includes(q) ?? false;
        const matchesProperty = v.property?.name.toLowerCase().includes(q) ?? false;
        if (!matchesRule && !matchesPage && !matchesProperty) return false;
      }
      if (filters.quickFilter === "my-issues" && v.assigneeId !== currentUserId) {
        return false;
      }
      if (
        filters.quickFilter === "unfixed" &&
        v.status !== "open" &&
        v.status !== "in-progress"
      ) {
        return false;
      }
      if (filters.quickFilter === "needs-attention") {
        const highSeverity = v.impact === "critical" || v.impact === "serious";
        if (!highSeverity || v.status !== "open") return false;
      }
      return true;
    });
  }, [violations, filters, activeSearch, currentUserId]);

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
    setQuickFilter,
    setAll,
    reset,
  };
};
