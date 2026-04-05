"use client";

import { useMemo } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type {
  IssueViewMode,
  AvailablePage,
  AvailableRule,
} from "../components/IssueFilterBar";
import { aggregateIssues } from "../utils/aggregateIssues";

interface UseIssueDerivedDataArgs {
  violations: HydratedViolation[];
  filteredViolations: HydratedViolation[];
  viewMode: IssueViewMode;
  activeViolationId: string | null;
  activeGroupId: string | null;
}

/**
 * Derives all computed values the Issues workspace needs from raw violations,
 * filtered violations, and current view state.
 *
 * Nothing here mutates state — pure derivation only.
 */
export const useIssueDerivedData = ({
  violations,
  filteredViolations,
  viewMode,
  activeViolationId,
  activeGroupId,
}: UseIssueDerivedDataArgs) => {
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

  const subtitle = useMemo(() => {
    const unfixedViolations = violations.filter(
      (v) => v.status === "open" || v.status === "in-progress",
    );
    const criticalUnfixedCount = unfixedViolations.filter(
      (v) => v.impact === "critical",
    ).length;
    const propertyCount = new Set(
      unfixedViolations.map((v) => v.property?.id).filter(Boolean),
    ).size;
    return criticalUnfixedCount > 0
      ? `${unfixedViolations.length} unfixed issues · ${criticalUnfixedCount} critical · ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`
      : `${unfixedViolations.length} unfixed issues · ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;
  }, [violations]);

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

  const summaryText =
    viewMode === "grouped-rule"
      ? `Showing ${groupedIssues.length} grouped issues from ${filteredViolations.length} issue instances`
      : viewMode === "grouped-page"
        ? `Showing ${filteredViolations.length} issues grouped by page`
        : `Showing ${filteredViolations.length} of ${violations.length} issues`;

  return {
    groupedIssues,
    activeViolation,
    activeGroupedIssue,
    subtitle,
    availableRules,
    availablePages,
    rulePageCounts,
    isEmpty,
    summaryText,
  };
};
