"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScansScreenData } from "@/lib/data";
import ScanList from "./ScanList";

interface ScansClientProps {
  data: ScansScreenData;
}

const ScansClient = ({ data }: ScansClientProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");

  const { scanRows } = data;

  const properties = Array.from(
    new Map(scanRows.map((row) => [row.property.id, row.property])).values(),
  );

  const filteredRows =
    selectedPropertyId === "all"
      ? scanRows
      : scanRows.filter((row) => row.property.id === selectedPropertyId);

  const isFiltered = selectedPropertyId !== "all";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scans</h1>
          <p className="mt-1 text-sm text-muted-foreground">Audit history</p>
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
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScanList
        rows={filteredRows}
        totalCount={scanRows.length}
        isFiltered={isFiltered}
      />
    </div>
  );
};

export default ScansClient;
