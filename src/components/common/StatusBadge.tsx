import type { RemediationStatus } from "@/types/domain";

const config: Record<RemediationStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-status-open text-white dark:text-background",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-status-in-progress text-white dark:text-background",
  },
  fixed: {
    label: "Fixed",
    className: "bg-status-fixed text-white dark:text-background",
  },
  verified: {
    label: "Verified",
    className: "bg-status-verified text-white dark:text-background",
  },
  "accepted-risk": {
    label: "Accepted risk",
    className: "bg-status-accepted-risk text-white dark:text-background",
  },
};

interface StatusBadgeProps {
  status: RemediationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
