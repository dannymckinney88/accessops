import type { Priority } from "@/types/domain";

// Priority maps to severity colors — urgent=critical, high=serious, medium=moderate, low=muted.
const config: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-severity-critical text-white",
  },
  high: {
    label: "High",
    className: "bg-severity-serious text-white",
  },
  medium: {
    label: "Medium",
    className: "bg-severity-moderate text-background",
  },
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground",
  },
};

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const { label, className } = config[priority];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default PriorityBadge;
