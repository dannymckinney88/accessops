"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { IssueFilters } from "./useIssueFilters";
import type { IssueViewMode } from "../components/IssueFilterBar";

interface UseIssueWorkspaceStateArgs {
  /** Current filter state — used only for URL sync. */
  filters: IssueFilters;
}

/**
 * Owns all URL-driven workspace state for the Issues screen:
 * - active issue / group IDs from search params
 * - view mode (initialized from URL, synced back on change)
 * - drawer open / close helpers
 * - focus restoration after drawer close
 * - URL param synchronization for filter + view state
 */
export const useIssueWorkspaceState = ({
  filters,
}: UseIssueWorkspaceStateArgs) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeViolationId = searchParams.get("issueId") ?? null;
  const activeGroupId = searchParams.get("groupId") ?? null;

  const [viewMode, setViewMode] = useState<IssueViewMode>(() => {
    const v = searchParams.get("view");
    return v === "grouped-page" || v === "grouped-rule" ? v : "flat";
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRowIdRef = useRef<string | null>(null);

  // Focus the page heading on mount so screen readers announce the screen title.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { propertyIds, pageIds, ruleIds, assigneeIds, search } = filters;

  const propertyIdsKey = propertyIds.join(",");
  const pageIdsKey = pageIds.join(",");
  const ruleIdsKey = ruleIds.join(",");
  const assigneeIdsKey = assigneeIds.join(",");

  // Sync shareable filter state → URL. Severity and status stay session-local;
  // on reload the Issues screen remains unfiltered, with active work surfaced
  // by the default table sort rather than persisted filter params.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // viewMode — omit "flat" (default) to keep URLs clean
    if (viewMode === "flat") params.delete("view");
    else params.set("view", viewMode);

    // Multi-value array params: delete all then re-append
    params.delete("propertyId");
    propertyIds.forEach((id) => params.append("propertyId", id));

    params.delete("pageId");
    pageIds.forEach((id) => params.append("pageId", id));

    params.delete("ruleId");
    ruleIds.forEach((id) => params.append("ruleId", id));

    params.delete("assigneeId");
    assigneeIds.forEach((id) => params.append("assigneeId", id));

    if (search) params.set("search", search);
    else params.delete("search");

    const newQs = params.toString();
    if (newQs === searchParams.toString()) return;

    router.replace(newQs ? `${pathname}?${newQs}` : pathname, {
      scroll: false,
    });
  }, [
    viewMode,
    propertyIds,
    pageIds,
    ruleIds,
    assigneeIds,
    search,
    propertyIdsKey,
    pageIdsKey,
    ruleIdsKey,
    assigneeIdsKey,
    pathname,
    router,
    searchParams,
  ]);

  const openViolationDrawer = (id: string) => {
    triggerRowIdRef.current = id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("issueId", id);
    params.delete("groupId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openGroupedIssueDrawer = (id: string) => {
    triggerRowIdRef.current = id;
    const params = new URLSearchParams(searchParams.toString());
    params.set("groupId", id);
    params.delete("issueId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("issueId");
    params.delete("groupId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  /**
   * Restores keyboard focus after the drawer closes.
   *
   * Priority order:
   * 1. The row that originally opened the drawer
   * 2. The first focusable row in the table
   * 3. The page heading (screen reader fallback)
   *
   * Returns true when focus was successfully moved.
   */
  const focusTriggerRow = (): boolean => {
    const id = triggerRowIdRef.current;

    if (id) {
      const trigger = document.querySelector<HTMLElement>(
        `[data-issue-id="${id}"] button`,
      );
      if (trigger) {
        requestAnimationFrame(() => {
          trigger.focus();
          triggerRowIdRef.current = null;
        });
        return true;
      }
    }

    const firstTrigger = document.querySelector<HTMLElement>(
      "[data-issues-table] [data-issue-id] button",
    );
    if (firstTrigger) {
      requestAnimationFrame(() => {
        firstTrigger.focus();
        triggerRowIdRef.current = null;
      });
      return true;
    }

    if (headingRef.current) {
      requestAnimationFrame(() => {
        headingRef.current?.focus();
        triggerRowIdRef.current = null;
      });
      return true;
    }

    triggerRowIdRef.current = null;
    return false;
  };

  return {
    activeViolationId,
    activeGroupId,
    viewMode,
    setViewMode,
    headingRef,
    openViolationDrawer,
    openGroupedIssueDrawer,
    closeDrawer,
    focusTriggerRow,
  };
};
