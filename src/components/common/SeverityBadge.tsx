import type { Severity } from "@/types/domain";

// SeverityBadge.tsx
const config: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className:
      "bg-severity-critical/20 text-severity-critical border border-severity-critical/40 dark:bg-severity-critical dark:text-background dark:border-0",
  },
  serious: {
    label: "Serious",
    className:
      "bg-severity-serious/20 text-severity-serious border border-severity-serious/40 dark:bg-severity-serious dark:text-background dark:border-0",
  },
  moderate: {
    label: "Moderate",
    className:
      "bg-severity-moderate/20 text-severity-moderate border border-severity-moderate/40 dark:bg-severity-moderate dark:text-background dark:border-0",
  },
  minor: {
    label: "Minor",
    className:
      "bg-severity-minor/20 text-severity-minor border border-severity-minor/40 dark:bg-severity-minor dark:text-background dark:border-0",
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
