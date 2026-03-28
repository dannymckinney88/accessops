import type { Severity } from "@/types/domain";

const config: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-severity-critical text-white",
  },
  serious: {
    label: "Serious",
    className: "bg-severity-serious text-white",
  },
  moderate: {
    label: "Moderate",
    className: "bg-severity-moderate text-background",
  },
  minor: {
    label: "Minor",
    className: "bg-severity-minor text-white",
  },
};

interface SeverityBadgeProps {
  severity: Severity;
}

const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const { label, className } = config[severity];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default SeverityBadge;
