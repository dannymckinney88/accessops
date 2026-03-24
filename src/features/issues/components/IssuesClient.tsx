"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { HydratedViolation, Property } from "@/lib/data/index";
import { useIssueFilters } from "../hooks/useIssueFilters";
import IssueFilterBar from "./IssueFilterBar";
import IssuesTable from "./IssuesTable";
import IssueDrawer from "./IssueDrawer";

interface IssuesClientProps {
  violations: HydratedViolation[];
  properties: Property[];
}

const IssuesClient = ({ violations, properties }: IssuesClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeViolationId = searchParams.get("id") ?? null;

  const openDrawer = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Replace instead of push: closing the drawer shouldn't pollute browser history.
  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const {
    filters,
    filteredViolations,
    hasActiveFilters,
    activeSearch,
    toggleSeverity,
    setPropertyId,
    setSearch,
    setQuickFilter,
    reset,
  } = useIssueFilters(violations);

  const activeViolation =
    activeViolationId !== null
      ? (violations.find((v) => v.id === activeViolationId) ?? null)
      : null;

  const openViolations = violations.filter((v) => v.status !== "resolved");
  const propertyCount = new Set(
    openViolations.map((v) => v.property?.id).filter(Boolean),
  ).size;
  const subtitle = `${openViolations.length} open issues across ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <IssueFilterBar
        filters={filters}
        properties={properties}
        totalCount={violations.length}
        filteredCount={filteredViolations.length}
        hasActiveFilters={hasActiveFilters}
        activeSearch={activeSearch}
        onToggleSeverity={toggleSeverity}
        onSetPropertyId={setPropertyId}
        onSetSearch={setSearch}
        onSetQuickFilter={setQuickFilter}
        onReset={reset}
      />

      {filteredViolations.length === 0 ? (
        <div role="status" className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No issues match the current filters."
              : "No violations found across all properties."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <IssuesTable
          violations={filteredViolations}
          activeViolationId={activeViolationId}
          onRowClick={openDrawer}
        />
      )}

      <IssueDrawer violation={activeViolation} onClose={closeDrawer} />
    </div>
  );
};

export default IssuesClient;
