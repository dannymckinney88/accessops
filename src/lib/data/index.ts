// src/lib/data/index.ts
//
// Single data access point for all features.
// All functions are async even over local data — this enables real loading/error
// states in components and keeps the access pattern swappable later.
// Never import raw data files directly into feature components or pages.

import { properties } from "./properties";
import { pages } from "./pages";
import { scanRuns } from "./scan-runs";
import { scanPages } from "./scan-pages";
import { rules } from "./rules";
import { violations } from "./violations";

import type {
  Property,
  Page,
  ScanRun,
  ScanPage,
  Rule,
  ViolationInstance,
} from "@/types/domain";

// ─── Re-exports for convenience ───────────────────────────────────────────────

export type { Property, Page, ScanRun, ScanPage, Rule, ViolationInstance };

// ─── Simple accessors ─────────────────────────────────────────────────────────

export const getProperties = async (): Promise<Property[]> => properties;

export const getPages = async (): Promise<Page[]> => pages;

export const getScanRuns = async (): Promise<ScanRun[]> => scanRuns;

export const getScanPages = async (): Promise<ScanPage[]> => scanPages;

export const getRules = async (): Promise<Rule[]> => rules;

export const getViolations = async (): Promise<ViolationInstance[]> =>
  violations;

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getPropertyById = async (
  id: string,
): Promise<Property | undefined> => properties.find((p) => p.id === id);

export const getRuleByRuleId = async (
  ruleId: string,
): Promise<Rule | undefined> => rules.find((r) => r.ruleId === ruleId);

export const getScanRunById = async (
  id: string,
): Promise<ScanRun | undefined> => scanRuns.find((sr) => sr.id === id);

// ─── Property-scoped queries ──────────────────────────────────────────────────

export const getScanRunsForProperty = async (
  propertyId: string,
): Promise<ScanRun[]> =>
  scanRuns
    .filter((sr) => sr.propertyId === propertyId)
    .sort(
      (a, b) =>
        new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
    );

export const getPagesForProperty = async (
  propertyId: string,
): Promise<Page[]> => pages.filter((p) => p.propertyId === propertyId);

// ─── Scan-scoped queries ──────────────────────────────────────────────────────

export const getScanPagesForScanRun = async (
  scanRunId: string,
): Promise<ScanPage[]> => scanPages.filter((sp) => sp.scanRunId === scanRunId);

export const getViolationsForScanRun = async (
  scanRunId: string,
): Promise<ViolationInstance[]> =>
  violations.filter((v) => v.scanRunId === scanRunId);

export const getViolationsForScanPage = async (
  scanPageId: string,
): Promise<ViolationInstance[]> =>
  violations.filter((v) => v.scanPageId === scanPageId);

// ─── Dashboard: property health summaries ─────────────────────────────────────
//
// Returns one summary row per property for the dashboard property health table.
// Derives trend direction from the last two completed scan runs per property.

export type PropertyHealthSummary = {
  property: Property;
  latestScanRun: ScanRun | null;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  unresolvedCount: number;
  trend: "improving" | "regressing" | "stable" | "insufficient-data";
};

export const getPropertyHealthSummaries = async (): Promise<
  PropertyHealthSummary[]
> => {
  return properties.map((property) => {
    const propertyScans = scanRuns
      .filter(
        (sr) => sr.propertyId === property.id && sr.status === "completed",
      )
      .sort(
        (a, b) =>
          new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
      );

    const latestScanRun = propertyScans[0] ?? null;

    // Violations for the latest scan run only
    const latestViolations = latestScanRun
      ? violations.filter((v) => v.scanRunId === latestScanRun.id)
      : [];

    const totalViolations = latestViolations.length;

    const criticalCount = latestViolations.filter(
      (v) => v.impact === "critical",
    ).length;

    const seriousCount = latestViolations.filter(
      (v) => v.impact === "serious",
    ).length;

    const unresolvedCount = latestViolations.filter(
      (violation) => violation.status !== "resolved",
    ).length;

    // Trend: compare violation counts between the two most recent scans
    let trend: PropertyHealthSummary["trend"] = "insufficient-data";

    if (propertyScans.length >= 2) {
      const previousScanRun = propertyScans[1];

      const previousScanPages = scanPages.filter(
        (sp) => sp.scanRunId === previousScanRun.id,
      );
      const latestScanPages = scanPages.filter(
        (sp) => sp.scanRunId === latestScanRun!.id,
      );

      const previousTotal = previousScanPages.reduce(
        (sum, sp) => sum + sp.violationCount,
        0,
      );
      const latestTotal = latestScanPages.reduce(
        (sum, sp) => sum + sp.violationCount,
        0,
      );

      if (latestTotal < previousTotal) trend = "improving";
      else if (latestTotal > previousTotal) trend = "regressing";
      else trend = "stable";
    }

    return {
      property,
      latestScanRun,
      totalViolations,
      criticalCount,
      seriousCount,
      unresolvedCount,
      trend,
    };
  });
};

// ─── Issues: filtered violation list ─────────────────────────────────────────
//
// Returns violations with their associated rule and page hydrated inline.
// This is what the Issues table consumes — no secondary lookups needed in the component.

export type HydratedViolation = ViolationInstance & {
  rule: Rule | undefined;
  page: Page | undefined;
  property: Property | undefined;
};

export const getHydratedViolations = async (): Promise<HydratedViolation[]> => {
  const scanPageMap = new Map(scanPages.map((sp) => [sp.id, sp]));
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const ruleMap = new Map(rules.map((r) => [r.ruleId, r]));
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  return violations.map((v) => {
    const scanPage = scanPageMap.get(v.scanPageId);
    const page = scanPage ? pageMap.get(scanPage.pageId) : undefined;
    const property = page ? propertyMap.get(page.propertyId) : undefined;
    const rule = ruleMap.get(v.ruleId);

    return { ...v, rule, page, property };
  });
};

// ─── Compare: two scan runs for the same property ────────────────────────────
//
// Compares violations between scan A and scan B.
// Match key: ruleId + first item in target array (selector).
// This is intentionally simple for MVP — good enough for the seeded data stories.

export type CompareState = "new" | "resolved" | "unchanged";

export type CompareResult = {
  scanRunA: ScanRun | undefined;
  scanRunB: ScanRun | undefined;
  newViolations: HydratedViolation[];
  resolvedViolations: HydratedViolation[];
  unchangedViolations: HydratedViolation[];
  summary: {
    newCount: number;
    resolvedCount: number;
    unchangedCount: number;
    netChange: number; // positive = more issues, negative = fewer
  };
};

export const getCompareResults = async (
  scanRunIdA: string,
  scanRunIdB: string,
): Promise<CompareResult> => {
  const scanRunA = scanRuns.find((sr) => sr.id === scanRunIdA);
  const scanRunB = scanRuns.find((sr) => sr.id === scanRunIdB);

  const allHydrated = await getHydratedViolations();

  const violationsA = allHydrated.filter((v) => v.scanRunId === scanRunIdA);
  const violationsB = allHydrated.filter((v) => v.scanRunId === scanRunIdB);

  // Match key: ruleId + primary selector
  const matchKey = (v: HydratedViolation) =>
    `${v.ruleId}::${v.target[0] ?? ""}`;

  const keysA = new Set(violationsA.map(matchKey));
  const keysB = new Set(violationsB.map(matchKey));

  const newViolations = violationsB.filter((v) => !keysA.has(matchKey(v)));
  const resolvedViolations = violationsA.filter((v) => !keysB.has(matchKey(v)));
  const unchangedViolations = violationsB.filter((v) => keysA.has(matchKey(v)));

  return {
    scanRunA,
    scanRunB,
    newViolations,
    resolvedViolations,
    unchangedViolations,
    summary: {
      newCount: newViolations.length,
      resolvedCount: resolvedViolations.length,
      unchangedCount: unchangedViolations.length,
      netChange: newViolations.length - resolvedViolations.length,
    },
  };
};
