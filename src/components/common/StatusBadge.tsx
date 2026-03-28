import type { RemediationStatus } from "@/types/domain";

const config: Record<RemediationStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-status-open text-status-open-foreground",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-status-in-progress text-status-in-progress-foreground",
  },
  resolved: {
    label: "Resolved",
    className: "bg-status-resolved text-status-resolved-foreground",
  },
  "accepted-risk": {
    label: "Accepted risk",
    className: "bg-status-accepted-risk text-status-accepted-risk-foreground",
  },
};

interface StatusBadgeProps {
  status: RemediationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border border-foreground/10 px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
