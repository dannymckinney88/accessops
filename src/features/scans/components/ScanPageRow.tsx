import Link from "next/link";
import { FileText, ArrowRight, AlertTriangle } from "lucide-react";
import type { ScanPageRowData } from "@/lib/data";

interface ScanPageRowProps {
  data: ScanPageRowData;
  propertyId: string;
}

const ScanPageRow = ({ data, propertyId }: ScanPageRowProps) => {
  const {
    page,
    remainingIssues,
    criticalRemaining,
    totalIssues,
    resolvedIssues,
  } = data;

  const href = `/issues?propertyId=${encodeURIComponent(propertyId)}&pageId=${encodeURIComponent(page.id)}`;

  return (
    <li className="border-t border-border/40 first:border-t-0">
      <Link
        href={href}
        className={[
          "flex items-center gap-4 px-5 py-3",
          "transition-colors duration-100",
          "hover:bg-accent/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        ].join(" ")}
        aria-label={`${page.title}. ${remainingIssues} remaining issues${
          criticalRemaining > 0 ? `, ${criticalRemaining} critical` : ""
        }. View this page in Issues.`}
      >
        <FileText
          className="size-3.5 shrink-0 text-muted-foreground/60"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {page.title}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {page.path}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <span
            className={`text-xs font-medium tabular-nums ${
              remainingIssues > 0 ? "text-foreground" : "text-muted-foreground"
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

          <span className="text-xs text-muted-foreground tabular-nums">
            {totalIssues} total · {resolvedIssues} resolved
          </span>
        </div>

        <div
          className="hidden shrink-0 items-center gap-1 text-xs font-medium text-foreground lg:flex"
          aria-hidden="true"
        >
          <span>View issues</span>
          <ArrowRight className="size-3.5" />
        </div>
      </Link>
    </li>
  );
};

export default ScanPageRow;
