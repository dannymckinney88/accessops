import type { Page, Property, ScanRun } from "@/types/domain";

export type ScanType = "Baseline" | "Rescan";

export type ScanPageRowData = {
  page: Page;
  totalIssues: number;
  remainingIssues: number;
  resolvedIssues: number;
  criticalRemaining: number;
};

export type ScanRowData = {
  scanRun: ScanRun;
  property: Property;
  scanType: ScanType;
  pages: ScanPageRowData[];
  totalIssues: number;
  remainingIssues: number;
  resolvedIssues: number;
  severitySummary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  isHighRisk: boolean;
};

export type PropertyHealthItem = {
  property: Property;
  trend: "improving" | "regressing" | "stable" | "insufficient-data";
  remainingIssues: number;
  criticalRemaining: number;
};

export type ScansScreenData = {
  scanRows: ScanRowData[];
  propertyHealthItems: PropertyHealthItem[];
  alertSummary: string | null;
};
