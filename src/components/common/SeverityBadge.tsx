import type { Severity } from "@/types/domain";

const config: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-severity-critical text-severity-critical-foreground",
  },
  serious: {
    label: "Serious",
    className: "bg-severity-serious text-severity-serious-foreground",
  },
  moderate: {
    label: "Moderate",
    className: "bg-severity-moderate text-severity-moderate-foreground",
  },
  minor: {
    label: "Minor",
    className: "bg-severity-minor text-severity-minor-foreground",
  },
};

interface SeverityBadgeProps {
  severity: Severity;
}

const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const { label, className } = config[severity];
  return (
    <span
      className={`inline-flex items-center rounded-md border border-foreground/10 px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default SeverityBadge;
