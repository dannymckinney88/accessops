"use client";

import { useEffect, useState } from "react";
import type { HydratedViolation } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import {
  applyOverrides,
  persistOverride,
  persistOverrides,
} from "../utils/issueOverrides";

/**
 * Owns the violations state and all mutation handlers.
 *
 * Applies localStorage overrides after mount so the initial render matches
 * server output exactly, avoiding hydration mismatches.
 */
export const useIssueMutations = (
  initialViolations: HydratedViolation[],
  users: User[],
) => {
  const [violations, setViolations] =
    useState<HydratedViolation[]>(initialViolations);

  // Apply any localStorage overrides once, after mount. applyOverrides returns
  // the same reference when the override map is empty, so React bails out with
  // no re-render in the common case of a fresh session.
  useEffect(() => {
    setViolations(applyOverrides(initialViolations, users));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = (id: string, assigneeId: string | null) => {
    persistOverride(id, { assigneeId });
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const assignee = assigneeId
          ? (users.find((u) => u.id === assigneeId) ?? undefined)
          : undefined;
        return { ...v, assigneeId: assigneeId ?? undefined, assignee };
      }),
    );
  };

  const handleBulkAssign = (ids: string[], assigneeId: string | null) => {
    persistOverrides(ids, { assigneeId });
    const idSet = new Set(ids);
    setViolations((prev) =>
      prev.map((v) => {
        if (!idSet.has(v.id)) return v;
        const assignee = assigneeId
          ? (users.find((u) => u.id === assigneeId) ?? undefined)
          : undefined;
        return { ...v, assigneeId: assigneeId ?? undefined, assignee };
      }),
    );
  };

  const handleBulkStatus = (ids: string[], status: RemediationStatus) => {
    const idSet = new Set(ids);
    // Only persist for violations that aren't already verified — matches the
    // guard in setViolations below.
    const eligibleIds = violations
      .filter((v) => idSet.has(v.id) && v.status !== "verified")
      .map((v) => v.id);
    persistOverrides(eligibleIds, { status });
    setViolations((prev) =>
      prev.map((v) => {
        if (!idSet.has(v.id)) return v;
        if (v.status === "verified") return v;
        return { ...v, status };
      }),
    );
  };

  const handleUpdateViolation = (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => {
    persistOverride(id, patch);
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v };
        if ("assigneeId" in patch) {
          updated.assigneeId = patch.assigneeId ?? undefined;
          updated.assignee = patch.assigneeId
            ? (users.find((u) => u.id === patch.assigneeId) ?? undefined)
            : undefined;
        }
        if (patch.status !== undefined) {
          updated.status = patch.status;
        }
        return updated;
      }),
    );
  };

  return {
    violations,
    handleAssign,
    handleBulkAssign,
    handleBulkStatus,
    handleUpdateViolation,
  };
};
