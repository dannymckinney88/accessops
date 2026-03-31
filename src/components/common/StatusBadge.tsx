import type { RemediationStatus } from "@/lib/data/types/domain";

const config: Record<RemediationStatus, { label: string; className: string }> =
  {
    open: {
      label: "Open",
      className:
        "bg-status-open/15 text-status-open border border-status-open/40",
    },
    "in-progress": {
      label: "In progress",
      className:
        "bg-status-in-progress/15 text-status-in-progress border border-status-in-progress/40",
    },
    fixed: {
      label: "Fixed",
      className:
        "bg-status-fixed/15 text-status-fixed border border-status-fixed/40",
    },
    verified: {
      label: "Verified",
      className:
        "bg-status-verified/15 text-status-verified border border-status-verified/40",
    },
    "accepted-risk": {
      label: "Accepted risk",
      className:
        "bg-status-accepted-risk/15 text-status-accepted-risk border border-status-accepted-risk/40",
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
