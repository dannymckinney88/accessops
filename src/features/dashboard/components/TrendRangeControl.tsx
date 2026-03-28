export type TrendRange = "7d" | "30d" | "90d" | "all";

const RANGES: { value: TrendRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "all", label: "All" },
];

interface TrendRangeControlProps {
  range: TrendRange;
  onChange: (range: TrendRange) => void;
}

const TrendRangeControl = ({ range, onChange }: TrendRangeControlProps) => {
  return (
    <div
      role="group"
      aria-label="Trend time range"
      className="inline-flex items-center rounded-md border bg-muted p-0.5 gap-px"
    >
      {RANGES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={range === value}
          className={[
            "h-6 rounded-sm px-2.5 text-xs font-medium transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            range === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TrendRangeControl;
