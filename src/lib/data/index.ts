// Single data access point for all features.
// states in components and keeps the access pattern swappable later.

import { properties } from "./properties";
import { pages } from "./pages";
import { scanRuns } from "./scan-runs";
import { scanPages } from "./scan-pages";
import { rules } from "./rules";
import { violations } from "./violations";
import { ruleContent } from "./rule-content";
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

// ─── Private helpers ──────────────────────────────────────────────────────────
// Merges authored explainability content into a raw rule object.

const enrichRule = (rule: Rule): Rule => ({
  ...rule,
  ...ruleContent[rule.ruleId],
});

// ─── Simple accessors ─────────────────────────────────────────────────────────

export const getProperties = async (): Promise<Property[]> => properties;

export const getPages = async (): Promise<Page[]> => pages;

export const getScanRuns = async (): Promise<ScanRun[]> => scanRuns;

export const getScanPages = async (): Promise<ScanPage[]> => scanPages;

export const getRules = async (): Promise<Rule[]> =>
  rules.map((rule) => enrichRule(rule));

export const getViolations = async (): Promise<ViolationInstance[]> =>
  violations;

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getPropertyById = async (
  id: string,
): Promise<Property | undefined> =>
  properties.find((property) => property.id === id);

export const getRuleByRuleId = async (
  ruleId: string,
): Promise<Rule | undefined> => {
  const rule = rules.find((rule) => rule.ruleId === ruleId);
  if (!rule) return undefined;
  return enrichRule(rule);
};

export const getScanRunById = async (
  id: string,
): Promise<ScanRun | undefined> =>
  scanRuns.find((scanRun) => scanRun.id === id);

// ─── Property-scoped queries ──────────────────────────────────────────────────

export const getScanRunsForProperty = async (
  propertyId: string,
): Promise<ScanRun[]> =>
  scanRuns
    .filter((scanRun) => scanRun.propertyId === propertyId)
    .sort(
      (a, b) =>
        new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
    );

export const getPagesForProperty = async (
  propertyId: string,
): Promise<Page[]> => pages.filter((page) => page.propertyId === propertyId);

// ─── Scan-scoped queries ──────────────────────────────────────────────────────

export const getScanPagesForScanRun = async (
  scanRunId: string,
): Promise<ScanPage[]> =>
  scanPages.filter((scanPage) => scanPage.scanRunId === scanRunId);

export const getViolationsForScanRun = async (
  scanRunId: string,
): Promise<ViolationInstance[]> =>
  violations.filter((violation) => violation.scanRunId === scanRunId);

export const getViolationsForScanPage = async (
  scanPageId: string,
): Promise<ViolationInstance[]> =>
  violations.filter((violation) => violation.scanPageId === scanPageId);

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
        (scanRun) =>
          scanRun.propertyId === property.id && scanRun.status === "completed",
      )
      .sort(
        (a, b) =>
          new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
      );

    const latestScanRun = propertyScans[0] ?? null;

    // Violations for the latest scan run only
    const latestViolations = latestScanRun
      ? violations.filter(
          (violation) => violation.scanRunId === latestScanRun.id,
        )
      : [];

    const totalViolations = latestViolations.length;

    const criticalCount = latestViolations.filter(
      (violation) => violation.impact === "critical",
    ).length;

    const seriousCount = latestViolations.filter(
      (violation) => violation.impact === "serious",
    ).length;

    const unresolvedCount = latestViolations.filter(
      (violation) => violation.status !== "resolved",
    ).length;

    // Trend: compare violation counts between the two most recent scans
    let trend: PropertyHealthSummary["trend"] = "insufficient-data";

    if (propertyScans.length >= 2) {
      const previousScanRun = propertyScans[1];

      const previousScanPages = scanPages.filter(
        (scanPage) => scanPage.scanRunId === previousScanRun.id,
      );
      const latestScanPages = scanPages.filter(
        (scanPage) => scanPage.scanRunId === latestScanRun!.id,
      );

      const previousTotal = previousScanPages.reduce(
        (sum, scanPage) => sum + scanPage.violationCount,
        0,
      );
      const latestTotal = latestScanPages.reduce(
        (sum, scanPage) => sum + scanPage.violationCount,
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
  const scanPageMap = new Map(
    scanPages.map((scanPage) => [scanPage.id, scanPage]),
  );
  const pageMap = new Map(pages.map((page) => [page.id, page]));
  const propertyMap = new Map(
    properties.map((property) => [property.id, property]),
  );
  const ruleMap = new Map(rules.map((rule) => [rule.ruleId, enrichRule(rule)]));

  return violations.map((violation) => {
    const scanPage = scanPageMap.get(violation.scanPageId);
    const page = scanPage ? pageMap.get(scanPage.pageId) : undefined;
    const property = page ? propertyMap.get(page.propertyId) : undefined;
    const rule = ruleMap.get(violation.ruleId);

    return { ...violation, rule, page, property };
  });
};

// ─── Dashboard: current-state types ──────────────────────────────────────────
//
// Reflects each property as of its most recent completed scan.
// All fields in DashboardCurrentState share this scope.
// Used by: subtitle, summary signals, severity distribution, property health.

export type SeverityDistributionPoint = {
  severity: "Critical" | "Serious" | "Moderate" | "Minor";
  count: number;
};

export type DashboardCurrentState = {
  totalViolations: number;
  criticalCount: number;
  propertyCount: number;
  propertiesWithCritical: number;
  severityDistribution: SeverityDistributionPoint[];
  propertyHealthSummaries: PropertyHealthSummary[];
};

// ─── Dashboard: trend types ───────────────────────────────────────────────────
//
// Historical time series across all scan rounds.
// Separate from current-state — the trend chart is an exploratory section
// that supports time range controls. Those controls must not affect the
// current-state numbers above.

export type TrendDataPoint = {
  label: string;
  date: string; // ISO initiatedAt from the reference scan run — used for client-side range filtering
  total: number;
  critical: number;
};

export type DashboardTrend = {
  dataPoints: TrendDataPoint[];
  summaryText: string; // base summary for the "all" range
};

// ─── Dashboard: composition type ─────────────────────────────────────────────
//
// DashboardSummary is the Dashboard route's data contract.
// It is DashboardCurrentState plus DashboardTrend — both scopes are present
// and clearly named. Fields are kept flat so components access them directly.

export type DashboardSummary = DashboardCurrentState & {
  trend: DashboardTrend;
};

// ─── Dashboard: current-state query ──────────────────────────────────────────
//
// Aggregates violation counts from the most recent completed scan per property.
// Every field uses the same snapshot so the numbers are internally consistent.

export const getDashboardCurrentState =
  async (): Promise<DashboardCurrentState> => {
    const summaries = await getPropertyHealthSummaries();

    const totalViolations = summaries.reduce(
      (sum, s) => sum + s.totalViolations,
      0,
    );
    const criticalCount = summaries.reduce(
      (sum, s) => sum + s.criticalCount,
      0,
    );
    const propertyCount = summaries.length;
    const propertiesWithCritical = summaries.filter(
      (s) => s.criticalCount > 0,
    ).length;

    // Severity distribution drawn from the same latest-scan violation set.
    const latestScanRunIds = new Set(
      summaries
        .filter((s) => s.latestScanRun !== null)
        .map((s) => s.latestScanRun!.id),
    );
    const latestViolations = violations.filter((v) =>
      latestScanRunIds.has(v.scanRunId),
    );
    const severityDistribution: SeverityDistributionPoint[] = [
      {
        severity: "Critical",
        count: latestViolations.filter((v) => v.impact === "critical").length,
      },
      {
        severity: "Serious",
        count: latestViolations.filter((v) => v.impact === "serious").length,
      },
      {
        severity: "Moderate",
        count: latestViolations.filter((v) => v.impact === "moderate").length,
      },
      {
        severity: "Minor",
        count: latestViolations.filter((v) => v.impact === "minor").length,
      },
    ];

    return {
      totalViolations,
      criticalCount,
      propertyCount,
      propertiesWithCritical,
      severityDistribution,
      propertyHealthSummaries: summaries,
    };
  };

// ─── Dashboard: trend query ───────────────────────────────────────────────────
//
// Builds the full historical time series across all scan rounds.
// Scan runs are aligned by index — all four properties scan approximately
// the same calendar dates, so per-slot totals represent a consistent point
// in time. Uses the violations array for both total and critical so counts
// are internally consistent.

export const getDashboardTrend = async (): Promise<DashboardTrend> => {
  const propertyRuns = properties.map((property) =>
    scanRuns
      .filter(
        (r) => r.propertyId === property.id && r.status === "completed",
      )
      .sort(
        (a, b) =>
          new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
      ),
  );

  // Marketing Site has the most regular schedule; use its scan dates as labels.
  const referenceRuns =
    propertyRuns.find((runs) => runs[0]?.propertyId === "prop-marketing") ??
    propertyRuns[0] ??
    [];

  const slotCount = referenceRuns.length;

  const dataPoints: TrendDataPoint[] = Array.from(
    { length: slotCount },
    (_, i) => {
      const date = referenceRuns[i]!.initiatedAt;
      const label = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      let total = 0;
      let critical = 0;
      for (const runs of propertyRuns) {
        const run = runs[i];
        if (!run) continue;
        const runViolations = violations.filter((v) => v.scanRunId === run.id);
        total += runViolations.length;
        critical += runViolations.filter(
          (v) => v.impact === "critical",
        ).length;
      }

      return { label, date, total, critical };
    },
  );

  // Base summary text for the "all" range.
  // Components derive range-specific text from filtered dataPoints when a
  // time control is active.
  const firstPoint = dataPoints[0];
  const lastPoint = dataPoints[dataPoints.length - 1];
  const totalDelta = (lastPoint?.total ?? 0) - (firstPoint?.total ?? 0);
  const criticalDelta = (lastPoint?.critical ?? 0) - (firstPoint?.critical ?? 0);

  const totalTrend =
    totalDelta < 0
      ? `Issues decreased by ${Math.abs(totalDelta)} since October`
      : totalDelta > 0
        ? `Issues increased by ${totalDelta} since October`
        : "Total issue count is unchanged since October";

  const criticalTrend =
    criticalDelta < 0
      ? `critical issues are down ${Math.abs(criticalDelta)}`
      : criticalDelta > 0
        ? `critical issues are up ${criticalDelta}`
        : "critical issue count is unchanged";

  return {
    dataPoints,
    summaryText: `${totalTrend}; ${criticalTrend}.`,
  };
};

// ─── Dashboard: composition entry point ──────────────────────────────────────
//
// Fetches current-state and trend in parallel and merges them into
// DashboardSummary for the Dashboard route.
// Route files call this; components receive DashboardSummary as props.

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [currentState, trend] = await Promise.all([
    getDashboardCurrentState(),
    getDashboardTrend(),
  ]);
  return { ...currentState, trend };
};

// ─── Compare: two scan runs for the same property ────────────────────────────
//
// Compares violations between scan A and scan B.
// Match key: ruleId + first item in target array (selector).

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
  const scanRunA = scanRuns.find((scanRun) => scanRun.id === scanRunIdA);
  const scanRunB = scanRuns.find((scanRun) => scanRun.id === scanRunIdB);

  const allHydrated = await getHydratedViolations();

  const violationsA = allHydrated.filter(
    (violation) => violation.scanRunId === scanRunIdA,
  );
  const violationsB = allHydrated.filter(
    (violation) => violation.scanRunId === scanRunIdB,
  );

  // Match key: ruleId + primary selector
  const matchKey = (violation: HydratedViolation) =>
    `${violation.ruleId}::${violation.target[0] ?? ""}`;

  const keysA = new Set(violationsA.map(matchKey));
  const keysB = new Set(violationsB.map(matchKey));

  const newViolations = violationsB.filter(
    (violation) => !keysA.has(matchKey(violation)),
  );
  const resolvedViolations = violationsA.filter(
    (violation) => !keysB.has(matchKey(violation)),
  );
  const unchangedViolations = violationsB.filter((violation) =>
    keysA.has(matchKey(violation)),
  );

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
