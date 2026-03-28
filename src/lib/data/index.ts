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

    // Trend direction: compare violation counts between the two most recent scans.
    // Uses violations.length (same source as totalViolations above) so the
    // direction signal is consistent with the counts shown alongside it.
    let trend: PropertyHealthSummary["trend"] = "insufficient-data";

    if (propertyScans.length >= 2) {
      const previousScanRun = propertyScans[1];
      const previousViolationCount = violations.filter(
        (v) => v.scanRunId === previousScanRun.id,
      ).length;

      if (totalViolations < previousViolationCount) trend = "improving";
      else if (totalViolations > previousViolationCount) trend = "regressing";
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
  // highSeverityCount: critical + serious violations — tells how urgent the issue mix is.
  // Exposed here so signal cards and summaries share a single computed value.
  highSeverityCount: number;
  propertyCount: number;
  propertiesWithIssues: number;
  propertiesWithCritical: number;
  // regressingCount: how many properties are trend = "regressing" in the latest scan comparison.
  // This is the key momentum signal — tells whether the system is getting worse.
  regressingCount: number;
  unresolvedCount: number;
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
  summaryText: string; // base summary for the "all" range — trend direction and delta
  // attributionText: present when overall improvement is offset by a specific property
  // regressing. Rendered separately from summaryText so components can style it distinctly.
  attributionText?: string;
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
    const propertiesWithIssues = summaries.filter(
      (s) => s.totalViolations > 0,
    ).length;
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

    // highSeverityCount: violations that are critical or serious.
    // Used by signal cards and summaries to communicate issue urgency, not just volume.
    const highSeverityCount =
      severityDistribution[0].count + severityDistribution[1].count;

    // regressingCount: properties whose last two scans show an increase in violations.
    // This is the key direction signal — a non-zero value means the system is
    // getting worse somewhere even if the overall trend looks flat or improving.
    const regressingCount = summaries.filter(
      (s) => s.trend === "regressing",
    ).length;

    // unresolvedCount: total violations not in "resolved" status across latest scans.
    // Kept in the data layer to avoid inline reduction in components.
    const unresolvedCount = summaries.reduce(
      (sum, s) => sum + s.unresolvedCount,
      0,
    );

    return {
      totalViolations,
      criticalCount,
      highSeverityCount,
      propertyCount,
      propertiesWithIssues,
      propertiesWithCritical,
      regressingCount,
      unresolvedCount,
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

  // Use the actual first data point label so the summary is not hardcoded to
  // a specific month. With the seeded data this reads "since Oct 1".
  const sinceLabel = firstPoint?.label ?? "the first scan";

  const totalTrend =
    totalDelta < 0
      ? `Issues down ${Math.abs(totalDelta)} since ${sinceLabel}`
      : totalDelta > 0
        ? `Issues up ${totalDelta} since ${sinceLabel}`
        : `Issue count stable since ${sinceLabel}`;

  const criticalTrend =
    criticalDelta < 0
      ? `critical down ${Math.abs(criticalDelta)}`
      : criticalDelta > 0
        ? `critical up ${criticalDelta}`
        : "critical stable";

  // Per-property attribution: when the aggregate trend is improving but a specific
  // property is regressing, surface that separately so it isn't masked by the overall number.
  // Only computed when totalDelta < 0 (overall improving) — that's when the aggregate
  // is most likely to hide a worsening property beneath a cleanup elsewhere.
  let attributionText: string | undefined;
  if (totalDelta < 0) {
    let worstPropertyName: string | null = null;
    let worstDelta = 0;
    for (let pi = 0; pi < properties.length; pi++) {
      const runs = propertyRuns[pi];
      if (!runs || runs.length < 2) continue;
      const firstRun = runs[0]!;
      const lastRun = runs[runs.length - 1]!;
      const firstCount = violations.filter(
        (v) => v.scanRunId === firstRun.id,
      ).length;
      const lastCount = violations.filter(
        (v) => v.scanRunId === lastRun.id,
      ).length;
      const delta = lastCount - firstCount;
      if (delta > worstDelta) {
        worstDelta = delta;
        worstPropertyName = properties[pi]!.name;
      }
    }
    if (worstPropertyName) {
      attributionText = `${worstPropertyName} regression is now the primary driver of open risk.`;
    }
  }

  return {
    dataPoints,
    summaryText: `${totalTrend}; ${criticalTrend}.`,
    attributionText,
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
