import type { RemediationStatus } from "@/lib/data/types/domain";

export const EDITABLE_STATUSES: RemediationStatus[] = [
  "open",
  "in-progress",
  "fixed",
  "accepted-risk",
];

export const STATUS_LABEL: Record<RemediationStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  fixed: "Fixed",
  verified: "Verified",
  "accepted-risk": "Accepted Risk",
};
