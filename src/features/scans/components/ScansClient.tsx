"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScansScreenData } from "@/lib/data";
import PropertyHealthStrip from "./PropertyHealthStrip";

interface ScansClientProps {
  data: ScansScreenData;
}

const ScansClient = ({ data }: ScansClientProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");

  const { alertSummary, propertyHealthItems } = data;

  // All four properties, derived from health strip items.
  const properties = propertyHealthItems.map((item) => item.property);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Section 1: Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit history and remediation progress
          </p>
        </div>

        <Select
          value={selectedPropertyId}
          onValueChange={setSelectedPropertyId}
        >
          <SelectTrigger
            className="w-44 shrink-0"
            aria-label="Filter scans by property"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Section 2: Risk summary alert ──────────────────────────────── */}
      {alertSummary !== null && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-severity-critical/30 bg-severity-critical/[0.06] px-4 py-2.5"
        >
          <AlertTriangle
            className="size-4 shrink-0 text-severity-critical"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-severity-critical">
            {alertSummary}
          </p>
        </div>
      )}

      {/* ── Section 3: Property health strip ───────────────────────────── */}
      <PropertyHealthStrip items={propertyHealthItems} />
    </div>
  );
};

export default ScansClient;
