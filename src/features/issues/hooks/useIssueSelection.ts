"use client";

import { useEffect, useState } from "react";
import type { SortingState, PaginationState } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import type { IssueViewMode } from "../components/IssueFilterBar";

interface UseIssueSelectionArgs {
  /** IDs visible on the current paginated page — drives select-all behavior. */
  currentPageIds: string[];
  /** Boundary change deps — any change here clears the active selection. */
  violations: HydratedViolation[];
  sorting: SortingState;
  pagination: PaginationState;
  viewMode: IssueViewMode;
}

/**
 * Owns row selection state for the Issues table.
 *
 * Selection is page-scoped: select-all only covers the current paginated page,
 * and any meaningful boundary change (filter result set, sort, page turn, view
 * mode switch) clears the selection to prevent stale cross-page state.
 */
export const useIssueSelection = ({
  currentPageIds,
  violations,
  sorting,
  pagination,
  viewMode,
}: UseIssueSelectionArgs) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [violations, sorting, pagination.pageIndex, pagination.pageSize, viewMode]);

  const allPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.has(id));

  const somePageSelected = currentPageIds.some((id) => selectedIds.has(id));

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) currentPageIds.forEach((id) => next.add(id));
      else currentPageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleGroupSelect = (groupIds: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) groupIds.forEach((id) => next.add(id));
      else groupIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedIds,
    allPageSelected,
    somePageSelected,
    handleSelectAll,
    handleToggleSelect,
    handleGroupSelect,
    clearSelection,
  };
};
