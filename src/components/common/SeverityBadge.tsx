import type { Severity } from "@/lib/data/types/domain";

const config: Record<Severity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className:
      "bg-severity-critical/10 text-severity-critical border border-severity-critical/15",
  },
  serious: {
    label: "Serious",
    className:
      "bg-severity-serious/15 text-severity-serious border border-severity-serious/40",
  },
  moderate: {
    label: "Moderate",
    className:
      "bg-severity-moderate/15 text-severity-moderate border border-severity-moderate/40",
  },
  minor: {
    label: "Minor",
    className:
      "bg-severity-minor/15 text-severity-minor border border-severity-minor/40",
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
