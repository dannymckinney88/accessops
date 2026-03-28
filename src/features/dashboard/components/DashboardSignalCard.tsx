interface DashboardSignalCardProps {
  label: string;
  value: number;
  sublabel: string;
  /** When true, renders the value in the critical severity color. */
  critical?: boolean;
}

const DashboardSignalCard = ({
  label,
  value,
  sublabel,
  critical = false,
}: DashboardSignalCardProps) => {
  return (
    <div className="rounded-lg border bg-background p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p
        className={
          critical
            ? "text-3xl font-semibold tabular-nums text-severity-critical"
            : "text-3xl font-semibold tabular-nums text-foreground"
        }
      >
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
};

export default DashboardSignalCard;
