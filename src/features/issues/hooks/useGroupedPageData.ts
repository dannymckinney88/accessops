"use client";

import { useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";
import type { HydratedViolation } from "@/lib/data/index";
import type { IssueViewMode } from "../components/IssueFilterBar";
import { sortPageGroups, type PageGroupData } from "../utils/sortConfig";

interface UseGroupedPageDataArgs {
  /** Violations already ordered by the active TanStack sort model. */
  sortedViolations: HydratedViolation[];
  viewMode: IssueViewMode;
  sorting: SortingState;
}

/**
 * Derives the grouped-page structure from a pre-sorted flat violation list.
 *
 * Returns an empty array when the active view mode is not "grouped-page" so
 * callers never need to guard on mode before using the result.
 *
 * Rows within each group inherit the violation sort order; sortPageGroups only
 * controls the sequence of groups themselves.
 */
export const useGroupedPageData = ({
  sortedViolations,
  viewMode,
  sorting,
}: UseGroupedPageDataArgs): PageGroupData[] => {
  return useMemo(() => {
    if (viewMode !== "grouped-page") return [];

    const map = new Map<string, PageGroupData>();

    for (const violation of sortedViolations) {
      const key = violation.page?.id ?? "__none__";
      if (!map.has(key)) {
        map.set(key, {
          pageId: key,
          pageTitle: violation.page?.title ?? "No page",
          pagePath: violation.page?.path ?? "",
          propertyName: violation.property?.name ?? "",
          criticalCount: 0,
          violations: [],
        });
      }
      const group = map.get(key)!;
      group.violations.push(violation);
      if (violation.impact === "critical") group.criticalCount += 1;
    }

    return sortPageGroups(Array.from(map.values()), sorting);
  }, [sortedViolations, viewMode, sorting]);
};
