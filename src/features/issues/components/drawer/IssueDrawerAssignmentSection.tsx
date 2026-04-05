"use client";

import StatusBadge from "@/components/common/StatusBadge";
import type { HydratedViolation } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import { EDITABLE_STATUSES, STATUS_LABEL } from "../../utils/statusOptions";
import { drawerSelectClass } from "./drawerStyles";

interface IssueDrawerAssignmentSectionProps {
  violation: HydratedViolation;
  assignableUsers: User[];
  onUpdateViolation: (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => void;
}

const IssueDrawerAssignmentSection = ({
  violation,
  assignableUsers,
  onUpdateViolation,
}: IssueDrawerAssignmentSectionProps) => (
  <section aria-labelledby="drawer-actions-heading">
    <h3
      id="drawer-actions-heading"
      className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    >
      Assignment
    </h3>
    <div className="flex flex-wrap gap-3">
      <div className="flex min-w-[140px] flex-col gap-1">
        <label htmlFor="drawer-assignee" className="text-xs text-muted-foreground">
          Assignee
        </label>
        <select
          id="drawer-assignee"
          value={violation.assigneeId ?? ""}
          onChange={(e) =>
            onUpdateViolation(violation.id, {
              assigneeId: e.target.value || null,
            })
          }
          className={drawerSelectClass}
        >
          <option value="">Unassigned</option>
          {violation.assignee && !violation.assignee.isActive && (
            <option value={violation.assignee.id} disabled>
              {violation.assignee.name} (inactive)
            </option>
          )}
          {assignableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      {violation.status === "verified" ? (
        <div className="flex min-w-[140px] flex-col gap-1">
          <span className="text-xs text-muted-foreground">Status</span>
          <div className="flex items-center gap-2 py-1">
            <StatusBadge status="verified" />
            <span className="text-xs text-muted-foreground">Set by audit</span>
          </div>
        </div>
      ) : (
        <div className="flex min-w-[140px] flex-col gap-1">
          <label htmlFor="drawer-status" className="text-xs text-muted-foreground">
            Status
          </label>
          <select
            id="drawer-status"
            value={violation.status}
            onChange={(e) =>
              onUpdateViolation(violation.id, {
                status: e.target.value as RemediationStatus,
              })
            }
            className={drawerSelectClass}
          >
            {EDITABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  </section>
);

export default IssueDrawerAssignmentSection;
