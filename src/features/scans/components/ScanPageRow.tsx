import { FileText, AlertTriangle } from "lucide-react";
import type { ScanPageRowData } from "../types/scans";

interface ScanPageRowProps {
  data: ScanPageRowData;
}

const progressColor = (pct: number): string => {
  if (pct === 100) return "bg-status-verified";
  if (pct >= 50) return "bg-primary";
  if (pct > 0) return "bg-severity-serious";
  return "bg-muted-foreground/25";
};

const ScanPageRow = ({ data }: ScanPageRowProps) => {
  const { page, totalIssues, remainingIssues, resolvedIssues, criticalRemaining } =
    data;

  const pct =
    totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  return (
    <div className="flex items-center gap-4 border-b border-border/40 py-2.5 pl-10 pr-5 last:border-0">
      {/* Page icon — decorative */}
      <FileText
        className="size-3.5 shrink-0 text-muted-foreground/50"
        aria-hidden="true"
      />

      {/* Page name + path */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground/90">
          {page.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{page.path}</p>
      </div>

      {/* Remaining + critical count */}
      <div className="flex w-44 shrink-0 items-center gap-2">
        <span
          className={`tabular-nums text-sm ${
            remainingIssues > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {remainingIssues} remaining
        </span>

        {criticalRemaining > 0 && (
          <span
            className="flex items-center gap-1 text-xs font-medium text-severity-critical"
            aria-label={`${criticalRemaining} critical remaining`}
          >
            <AlertTriangle className="size-3" aria-hidden="true" />
            <span className="tabular-nums">{criticalRemaining}</span>
          </span>
        )}
      </div>

      {/* Total · resolved counts + mini progress bar */}
      <div className="hidden w-52 shrink-0 items-center justify-end gap-3 lg:flex">
        <span className="tabular-nums text-xs text-muted-foreground">
          {totalIssues} total · {resolvedIssues} resolved
        </span>

        {/* Progress bar is presentational — readable text above carries the value */}
        {totalIssues > 0 && (
          <div
            role="presentation"
            aria-hidden="true"
            className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={`h-full rounded-full ${progressColor(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPageRow;
