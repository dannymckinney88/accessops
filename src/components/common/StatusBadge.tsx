import type { RemediationStatus } from "@/types/domain";

const config: Record<RemediationStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-status-open text-white",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-status-in-progress text-white",
  },
  fixed: {
    label: "Fixed",
    className: "bg-status-fixed text-white",
  },
  verified: {
    label: "Verified",
    className: "bg-status-verified text-white",
  },
  "accepted-risk": {
    label: "Accepted risk",
    className: "bg-status-accepted-risk text-white",
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
