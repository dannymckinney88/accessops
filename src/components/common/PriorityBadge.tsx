import type { Priority } from "@/types/domain";

const config: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-priority-urgent text-priority-urgent-foreground",
  },
  high: {
    label: "High",
    className: "bg-priority-high text-priority-high-foreground",
  },
  medium: {
    label: "Medium",
    className: "bg-priority-medium text-priority-medium-foreground",
  },
  low: {
    label: "Low",
    className: "bg-priority-low text-priority-low-foreground",
  },
};

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const { label, className } = config[priority];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border border-foreground/10 px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default PriorityBadge;
