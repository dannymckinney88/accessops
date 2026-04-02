import type { ScanRowData } from "@/lib/data";
import ScanListRow from "./ScanListRow";

interface ScanListProps {
  rows: ScanRowData[];
  totalCount: number;
  isFiltered: boolean;
}

const ScanList = ({ rows, totalCount, isFiltered }: ScanListProps) => {
  return (
    <section aria-labelledby="scan-list-heading">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2
          id="scan-list-heading"
          className="text-sm font-medium text-foreground"
        >
          Audit Records
        </h2>

        <p
          className="text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFiltered
            ? `Showing ${rows.length} of ${totalCount}`
            : `${totalCount} total`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          role="status"
          className="rounded-lg border border-dashed py-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            No scans found for the selected property.
          </p>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Audit records"
          className="overflow-hidden rounded-lg border"
        >
          {rows.map((row) => (
            <ScanListRow key={row.scanRun.id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ScanList;
