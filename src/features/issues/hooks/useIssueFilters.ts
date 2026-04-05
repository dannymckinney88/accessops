"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  // kept for API compatibility; URL params are now the authoritative source of truth
  _initialFilters?: Partial<
    Pick<
      IssueFilters,
      "propertyIds" | "pageIds" | "ruleIds" | "assigneeIds" | "search"
    >
  >,
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<IssueFilters>(() => ({
    severity: searchParams.getAll("severity") as Severity[],
    status: searchParams.getAll("status") as RemediationStatus[],
    propertyIds: searchParams.getAll("property"),
    pageIds: searchParams.getAll("page"),
    ruleIds: searchParams.getAll("rule"),
    assigneeIds: searchParams.getAll("assignee"),
    search: searchParams.get("search") ?? "",
  }));
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const activeSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

  // Stable join-keys so the sync effect only re-runs when array contents change.
  const severityKey = filters.severity.join(",");
  const statusKey = filters.status.join(",");
  const propertyIdsKey = filters.propertyIds.join(",");
  const pageIdsKey = filters.pageIds.join(",");
  const ruleIdsKey = filters.ruleIds.join(",");
  const assigneeIdsKey = filters.assigneeIds.join(",");

  // Sync filter state → URL. All non-filter params (issueId, groupId, view) are
  // preserved because we start from the full current search string.
  // Default (empty) values are omitted so clean state produces a clean URL.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("severity");
    filters.severity.forEach((s) => params.append("severity", s));

    params.delete("status");
    filters.status.forEach((s) => params.append("status", s));

    params.delete("property");
    filters.propertyIds.forEach((id) => params.append("property", id));

    params.delete("page");
    filters.pageIds.forEach((id) => params.append("page", id));

    params.delete("rule");
    filters.ruleIds.forEach((id) => params.append("rule", id));

    params.delete("assignee");
    filters.assigneeIds.forEach((id) => params.append("assignee", id));

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    const newQs = params.toString();
    if (newQs === searchParams.toString()) return;

    router.replace(newQs ? `${pathname}?${newQs}` : pathname, {
      scroll: false,
    });
  }, [
    severityKey,
    statusKey,
    propertyIdsKey,
    pageIdsKey,
    ruleIdsKey,
    assigneeIdsKey,
    filters.severity,
    filters.status,
    filters.propertyIds,
    filters.pageIds,
    filters.ruleIds,
    filters.assigneeIds,
    filters.search,
    pathname,
    router,
    searchParams,
  ]);

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
