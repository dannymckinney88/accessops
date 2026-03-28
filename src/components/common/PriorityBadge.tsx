import type { Priority } from "@/types/domain";

// Priority maps to severity colors — urgent=critical, high=serious, medium=moderate, low=neutral.
const config: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className:
      "bg-severity-critical/15 text-severity-critical border border-severity-critical/40",
  },
  high: {
    label: "High",
    className:
      "bg-severity-serious/15 text-severity-serious border border-severity-serious/40",
  },
  medium: {
    label: "Medium",
    className:
      "bg-severity-moderate/15 text-severity-moderate border border-severity-moderate/40",
  },
  low: {
    label: "Low",
    className: "border border-border text-muted-foreground bg-transparent",
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
