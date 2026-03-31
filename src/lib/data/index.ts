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
import type {
  ScansScreenData,
  ScanRowData,
  ScanPageRowData,
  PropertyHealthItem,
} from "@/features/scans/types/scans";

// ─── Re-exports for convenience ───────────────────────────────────────────────

export type { Property, Page, ScanRun, ScanPage, Rule, ViolationInstance };
export type { ScansScreenData, ScanRowData, ScanPageRowData, PropertyHealthItem };

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
// Counts are derived from all violations across all scan runs for the property
// (full audit baseline), not just the latest scan.
// Trend direction is still scan-based: compares the two most recent completed scans.

export type PropertyHealthSummary = {
  property: Property;
  latestScanRun: ScanRun | null;
  totalViolations: number;
  // criticalCount: critical violations that are still unfixed — active risk scope.
  criticalCount: number;
  seriousCount: number;
  // unfixedCount: violations still requiring work — status "open" or "in-progress"
  unfixedCount: number;
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

    // All violations across every scan run for this property — the full audit baseline.
    const propertyScanIds = new Set(propertyScans.map((s) => s.id));
    const propertyViolations = violations.filter((v) =>
      propertyScanIds.has(v.scanRunId),
    );

    const totalViolations = propertyViolations.length;

    const seriousCount = propertyViolations.filter(
      (v) => v.impact === "serious",
    ).length;

    const unfixedViolations = propertyViolations.filter(
      (v) => v.status === "open" || v.status === "in-progress",
    );
    const unfixedCount = unfixedViolations.length;

    // criticalCount: critical violations that are still unfixed.
    // Scoped to active work so it aligns with what the team actually needs to address.
    const criticalCount = unfixedViolations.filter(
      (v) => v.impact === "critical",
    ).length;

    // Trend: compare raw violation counts between the two most recent scans.
    // Scan-based comparison is intentional here — it tells whether the most recent
    // deploy made things better or worse, independent of remediation state.
    let trend: PropertyHealthSummary["trend"] = "insufficient-data";

    if (propertyScans.length >= 2) {
      const latestCount = violations.filter(
        (v) => v.scanRunId === propertyScans[0]!.id,
      ).length;
      const previousCount = violations.filter(
        (v) => v.scanRunId === propertyScans[1]!.id,
      ).length;

      if (latestCount < previousCount) trend = "improving";
      else if (latestCount > previousCount) trend = "regressing";
      else trend = "stable";
    }

    return {
      property,
      latestScanRun,
      totalViolations,
      criticalCount,
      seriousCount,
      unfixedCount,
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
// Represents the full audit baseline and current remediation state.
// totalViolations = every violation in the dataset across all scans.
// criticalCount, highSeverityCount, unfixedCount, and severityDistribution
// are derived from unfixed violations (status "open" | "in-progress") only.
// Used by: subtitle, summary signals, severity distribution, property health.

export type SeverityDistributionPoint = {
  severity: "Critical" | "Serious" | "Moderate" | "Minor";
  count: number;
};

export type DashboardCurrentState = {
  // totalViolations: full audit baseline — every violation tracked across all scans.
  totalViolations: number;
  // criticalCount: critical violations that are still unfixed (open or in-progress).
  criticalCount: number;
  // highSeverityCount: critical + serious violations that are still unfixed.
  // Shared across signal cards and summaries so both show the same number.
  highSeverityCount: number;
  propertyCount: number;
  // propertiesWithIssues: properties with at least one unfixed violation.
  propertiesWithIssues: number;
  // propertiesWithCritical: properties with at least one critical unfixed violation.
  propertiesWithCritical: number;
  // regressingCount: properties whose last two scans show an increase in violations.
  regressingCount: number;
  // unfixedCount: violations still requiring work — status "open" or "in-progress".
  // This is the primary work-remaining signal.
  unfixedCount: number;
  // fixedCount: work completed internally, awaiting re-audit verification.
  fixedCount: number;
  // verifiedCount: confirmed resolved by a later audit — fully complete.
  verifiedCount: number;
  // acceptedRiskCount: known issues intentionally not fixed.
  acceptedRiskCount: number;
  severityDistribution: SeverityDistributionPoint[];
  propertyHealthSummaries: PropertyHealthSummary[];
  // topCriticalRule: the most frequently occurring unfixed critical rule.
  // null when no critical unfixed violations exist.
  topCriticalRule: {
    ruleId: string;
    // help: short human-readable label from the rule definition.
    help: string;
    count: number;
    propertyCount: number;
    // topPropertyName: name of the property with the most instances of this rule.
    topPropertyName: string;
    // pageCount: distinct pages that have at least one instance of this rule unfixed.
    pageCount: number;
  } | null;
  // topCriticalPages: pages with the highest critical unfixed violation counts.
  // Useful for page-level concentration when criticals cluster on specific flows.
  topCriticalPages: Array<{
    pageId: string;
    pageTitle: string;
    pagePath: string;
    propertyName: string;
    criticalCount: number;
  }>;
  // severityByProperty: unfixed violation counts split by severity for each property.
  // Drives the Severity by Property stacked bar section.
  severityByProperty: Array<{
    propertyId: string;
    propertyName: string;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  }>;
};

// ─── Dashboard: composition type ─────────────────────────────────────────────
//
// DashboardSummary is the Dashboard route's data contract.
// Alias of DashboardCurrentState — the dashboard shows current audit state only.
// Fields are kept flat so components access them directly.

export type DashboardSummary = DashboardCurrentState;

// ─── Dashboard: current-state query ──────────────────────────────────────────
//
// Derives dashboard KPIs from the full violation dataset grouped by lifecycle status.
// totalViolations = every violation ever tracked (full audit baseline).
// All urgency and distribution metrics use unfixed violations only (open | in-progress)
// so the dashboard answers "what still needs to be fixed?" not "what was last found?"

export const getDashboardCurrentState =
  async (): Promise<DashboardCurrentState> => {
    const summaries = await getPropertyHealthSummaries();

    // Full baseline: every violation in the dataset across all scans and properties.
    const allViolations = violations;
    const totalViolations = allViolations.length;

    // Lifecycle buckets — the primary lens for all dashboard KPIs.
    const unfixedViolations = allViolations.filter(
      (v) => v.status === "open" || v.status === "in-progress",
    );
    const unfixedCount = unfixedViolations.length;
    const fixedCount = allViolations.filter((v) => v.status === "fixed").length;
    const verifiedCount = allViolations.filter(
      (v) => v.status === "verified",
    ).length;
    const acceptedRiskCount = allViolations.filter(
      (v) => v.status === "accepted-risk",
    ).length;

    // criticalCount: critical violations that still need work.
    const criticalCount = unfixedViolations.filter(
      (v) => v.impact === "critical",
    ).length;

    // Severity distribution scoped to unfixed violations — shows the urgency mix
    // of remaining work, not the shape of historical findings.
    const severityDistribution: SeverityDistributionPoint[] = [
      {
        severity: "Critical",
        count: unfixedViolations.filter((v) => v.impact === "critical").length,
      },
      {
        severity: "Serious",
        count: unfixedViolations.filter((v) => v.impact === "serious").length,
      },
      {
        severity: "Moderate",
        count: unfixedViolations.filter((v) => v.impact === "moderate").length,
      },
      {
        severity: "Minor",
        count: unfixedViolations.filter((v) => v.impact === "minor").length,
      },
    ];

    // highSeverityCount: critical + serious unfixed violations.
    const highSeverityCount =
      severityDistribution[0].count + severityDistribution[1].count;

    const propertyCount = summaries.length;

    // propertiesWithIssues / propertiesWithCritical: scoped to unfixed violations
    // so these counts reflect active risk, not historical accumulation.
    const scanRunPropertyMap = new Map<string, string>(
      scanRuns.map((sr) => [sr.id, sr.propertyId]),
    );

    const propertiesWithUnfixedIssues = new Set<string>();
    const propertiesWithCriticalUnfixed = new Set<string>();
    for (const v of unfixedViolations) {
      const propId = scanRunPropertyMap.get(v.scanRunId);
      if (!propId) continue;
      propertiesWithUnfixedIssues.add(propId);
      if (v.impact === "critical") propertiesWithCriticalUnfixed.add(propId);
    }
    const propertiesWithIssues = propertiesWithUnfixedIssues.size;
    const propertiesWithCritical = propertiesWithCriticalUnfixed.size;

    // regressingCount: properties whose last two scans show an increase in violations.
    const regressingCount = summaries.filter(
      (s) => s.trend === "regressing",
    ).length;

    // Shared scanPage → page mapping used by topCriticalRule and topCriticalPages.
    const scanPageIdToPageId = new Map(
      scanPages.map((sp) => [sp.id, sp.pageId]),
    );

    // topCriticalRule: most frequently occurring unfixed critical rule.
    // Groups by ruleId, picks the highest count, resolves the rule's help text.
    const criticalUnfixed = unfixedViolations.filter(
      (v) => v.impact === "critical",
    );
    let topCriticalRule: DashboardCurrentState["topCriticalRule"] = null;
    if (criticalUnfixed.length > 0) {
      const ruleCounts = new Map<string, number>();
      for (const v of criticalUnfixed) {
        ruleCounts.set(v.ruleId, (ruleCounts.get(v.ruleId) ?? 0) + 1);
      }
      let topRuleId = "";
      let topCount = 0;
      for (const [ruleId, count] of ruleCounts) {
        if (count > topCount) {
          topCount = count;
          topRuleId = ruleId;
        }
      }
      const rule = rules.find((r) => r.ruleId === topRuleId);
      const affectedProperties = new Set<string>();
      const propertyRuleCounts = new Map<string, number>();
      for (const v of criticalUnfixed) {
        if (v.ruleId !== topRuleId) continue;
        const propId = scanRunPropertyMap.get(v.scanRunId);
        if (propId) {
          affectedProperties.add(propId);
          propertyRuleCounts.set(
            propId,
            (propertyRuleCounts.get(propId) ?? 0) + 1,
          );
        }
      }
      let topPropertyId = "";
      let topPropertyRuleCount = 0;
      for (const [propId, count] of propertyRuleCounts) {
        if (count > topPropertyRuleCount) {
          topPropertyRuleCount = count;
          topPropertyId = propId;
        }
      }
      const topProperty = properties.find((p) => p.id === topPropertyId);
      const affectedPages = new Set<string>();
      for (const v of criticalUnfixed) {
        if (v.ruleId !== topRuleId) continue;
        const pageId = scanPageIdToPageId.get(v.scanPageId);
        if (pageId) affectedPages.add(pageId);
      }
      topCriticalRule = {
        ruleId: topRuleId,
        help: rule?.help ?? topRuleId,
        count: topCount,
        propertyCount: affectedProperties.size,
        pageCount: affectedPages.size,
        topPropertyName: topProperty?.name ?? "",
      };
    }

    // topCriticalPages: pages with the highest critical unfixed concentration.
    const pageMap = new Map(pages.map((p) => [p.id, p]));
    const propertyNameMap = new Map(
      properties.map((p) => [p.id, p.name]),
    );

    const pageCriticalCounts = new Map<string, number>();
    for (const v of criticalUnfixed) {
      const pageId = scanPageIdToPageId.get(v.scanPageId);
      if (pageId) {
        pageCriticalCounts.set(pageId, (pageCriticalCounts.get(pageId) ?? 0) + 1);
      }
    }
    const topCriticalPages = [...pageCriticalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([pageId, count]) => {
        const page = pageMap.get(pageId);
        const propertyName = page
          ? (propertyNameMap.get(page.propertyId) ?? "")
          : "";
        return {
          pageId,
          pageTitle: page?.title ?? pageId,
          pagePath: page?.path ?? "",
          propertyName,
          criticalCount: count,
        };
      });

    // severityByProperty: unfixed violation counts by severity for each property.
    // Uses scanRunPropertyMap and unfixedViolations — both already computed above.
    const severityByProperty = properties
      .map((property) => {
        const propertyUnfixed = unfixedViolations.filter(
          (v) => scanRunPropertyMap.get(v.scanRunId) === property.id,
        );
        const critical = propertyUnfixed.filter(
          (v) => v.impact === "critical",
        ).length;
        const serious = propertyUnfixed.filter(
          (v) => v.impact === "serious",
        ).length;
        const moderate = propertyUnfixed.filter(
          (v) => v.impact === "moderate",
        ).length;
        const minor = propertyUnfixed.filter(
          (v) => v.impact === "minor",
        ).length;
        return {
          propertyId: property.id,
          propertyName: property.name,
          critical,
          serious,
          moderate,
          minor,
          total: critical + serious + moderate + minor,
        };
      })
      .filter((p) => p.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      totalViolations,
      criticalCount,
      highSeverityCount,
      propertyCount,
      propertiesWithIssues,
      propertiesWithCritical,
      regressingCount,
      unfixedCount,
      fixedCount,
      verifiedCount,
      acceptedRiskCount,
      severityDistribution,
      propertyHealthSummaries: summaries,
      topCriticalRule,
      topCriticalPages,
      severityByProperty,
    };
  };

// ─── Dashboard: composition entry point ──────────────────────────────────────
//
// Returns current audit state for the Dashboard route.
// Route files call this; components receive DashboardSummary as props.

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  return getDashboardCurrentState();
};

// ─── Compare: two scan runs for the same property ────────────────────────────
//
// Compares violations between scan A and scan B.
// Match key: ruleId + first item in target array (selector).

// CompareState describes the audit-vs-audit diff category for a violation.
// "no-longer-present" means the violation appeared in scan A but not scan B —
// it may be fixed (internal work done) or verified (confirmed gone in scan B).
export type CompareState = "new" | "no-longer-present" | "persisting";

export type CompareResult = {
  scanRunA: ScanRun | undefined;
  scanRunB: ScanRun | undefined;
  newViolations: HydratedViolation[];
  noLongerPresentViolations: HydratedViolation[];
  persistingViolations: HydratedViolation[];
  summary: {
    newCount: number;
    noLongerPresentCount: number;
    persistingCount: number;
    netChange: number; // positive = more issues, negative = fewer
  };
};

// ─── Scans screen: audit history + remediation progress ──────────────────────
//
// Produces one ScanRowData per completed ScanRun, sorted newest first.
// Each row includes per-page breakdowns and lifecycle counts.
// Scan type (Baseline / Rescan) is derived: earliest scan per property = Baseline.
// Property health strip is scoped to the latest scan per property only.

export const getScansScreenData = async (): Promise<ScansScreenData> => {
  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const pageMap = new Map(pages.map((p) => [p.id, p]));

  // Group completed scan runs by property, sorted oldest→newest for baseline derivation.
  const scansByProperty = new Map<string, ScanRun[]>();
  for (const sr of scanRuns) {
    if (sr.status !== "completed") continue;
    const bucket = scansByProperty.get(sr.propertyId) ?? [];
    bucket.push(sr);
    scansByProperty.set(sr.propertyId, bucket);
  }
  for (const bucket of scansByProperty.values()) {
    bucket.sort(
      (a, b) =>
        new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
    );
  }

  // The oldest scan per property is the Baseline; all others are Rescans.
  const baselineScanIds = new Set<string>();
  for (const bucket of scansByProperty.values()) {
    if (bucket[0]) baselineScanIds.add(bucket[0].id);
  }

  // Index scan-pages and violations for O(1) lookup.
  const scanPagesByScanRunId = new Map<string, ScanPage[]>();
  for (const sp of scanPages) {
    const bucket = scanPagesByScanRunId.get(sp.scanRunId) ?? [];
    bucket.push(sp);
    scanPagesByScanRunId.set(sp.scanRunId, bucket);
  }

  const violationsByScanRunId = new Map<string, ViolationInstance[]>();
  const violationsByScanPageId = new Map<string, ViolationInstance[]>();
  for (const v of violations) {
    const byScan = violationsByScanRunId.get(v.scanRunId) ?? [];
    byScan.push(v);
    violationsByScanRunId.set(v.scanRunId, byScan);

    const byPage = violationsByScanPageId.get(v.scanPageId) ?? [];
    byPage.push(v);
    violationsByScanPageId.set(v.scanPageId, byPage);
  }

  // Build one ScanRowData per completed scan run.
  const completedRuns = scanRuns.filter((sr) => sr.status === "completed");
  const sortedRuns = [...completedRuns].sort(
    (a, b) =>
      new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
  );

  const scanRows: ScanRowData[] = sortedRuns.map((scanRun) => {
    const property = propertyMap.get(scanRun.propertyId)!;
    const scanType = baselineScanIds.has(scanRun.id) ? "Baseline" : "Rescan";
    const scanViolations = violationsByScanRunId.get(scanRun.id) ?? [];

    const totalIssues = scanViolations.length;
    const remainingViolations = scanViolations.filter(
      (v) => v.status === "open" || v.status === "in-progress",
    );
    const remainingIssues = remainingViolations.length;
    const resolvedIssues = scanViolations.filter(
      (v) => v.status === "fixed" || v.status === "verified",
    ).length;

    const severitySummary = {
      critical: remainingViolations.filter((v) => v.impact === "critical")
        .length,
      serious: remainingViolations.filter((v) => v.impact === "serious").length,
      moderate: remainingViolations.filter((v) => v.impact === "moderate")
        .length,
      minor: remainingViolations.filter((v) => v.impact === "minor").length,
    };

    // Per-page breakdown for the expanded row.
    const pageScanPages = scanPagesByScanRunId.get(scanRun.id) ?? [];
    const pageRows: ScanPageRowData[] = pageScanPages
      .map((sp): ScanPageRowData | null => {
        const page = pageMap.get(sp.pageId);
        if (!page) return null;
        const pageViolations = violationsByScanPageId.get(sp.id) ?? [];
        const pageRemaining = pageViolations.filter(
          (v) => v.status === "open" || v.status === "in-progress",
        );
        return {
          page,
          totalIssues: pageViolations.length,
          remainingIssues: pageRemaining.length,
          resolvedIssues: pageViolations.filter(
            (v) => v.status === "fixed" || v.status === "verified",
          ).length,
          criticalRemaining: pageRemaining.filter((v) => v.impact === "critical")
            .length,
        };
      })
      .filter((r): r is ScanPageRowData => r !== null);

    const isHighRisk = remainingIssues > 0 && severitySummary.critical > 0;

    return {
      scanRun,
      property,
      scanType,
      pages: pageRows,
      totalIssues,
      remainingIssues,
      resolvedIssues,
      severitySummary,
      isHighRisk,
    };
  });

  // Property health strip — scoped to the latest scan per property.
  const propertyHealthItems: PropertyHealthItem[] = [];
  for (const [propertyId, bucket] of scansByProperty) {
    const property = propertyMap.get(propertyId);
    if (!property) continue;

    const latestScan = bucket[bucket.length - 1]!;
    const latestViolations = violationsByScanRunId.get(latestScan.id) ?? [];
    const latestRemaining = latestViolations.filter(
      (v) => v.status === "open" || v.status === "in-progress",
    );

    // Trend: compare violation counts between the two most recent scans.
    let trend: PropertyHealthItem["trend"] = "insufficient-data";
    if (bucket.length >= 2) {
      const latestCount = (
        violationsByScanRunId.get(bucket[bucket.length - 1]!.id) ?? []
      ).length;
      const prevCount = (
        violationsByScanRunId.get(bucket[bucket.length - 2]!.id) ?? []
      ).length;
      if (latestCount < prevCount) trend = "improving";
      else if (latestCount > prevCount) trend = "regressing";
      else trend = "stable";
    }

    propertyHealthItems.push({
      property,
      trend,
      remainingIssues: latestRemaining.length,
      criticalRemaining: latestRemaining.filter((v) => v.impact === "critical")
        .length,
    });
  }

  // Sort: regressing first, then by remaining issues descending.
  propertyHealthItems.sort((a, b) => {
    if (a.trend === "regressing" && b.trend !== "regressing") return -1;
    if (b.trend === "regressing" && a.trend !== "regressing") return 1;
    return b.remainingIssues - a.remainingIssues;
  });

  // Alert summary: surface the highest-risk story.
  let alertSummary: string | null = null;
  const worst = propertyHealthItems[0];
  if (worst && worst.remainingIssues > 0) {
    if (worst.trend === "regressing") {
      const detail =
        worst.criticalRemaining > 0
          ? `${worst.criticalRemaining} critical ${worst.criticalRemaining === 1 ? "issue" : "issues"}`
          : `${worst.remainingIssues} ${worst.remainingIssues === 1 ? "issue" : "issues"}`;
      alertSummary = `${worst.property.name} is regressing · ${detail} still unresolved`;
    } else if (worst.criticalRemaining > 0) {
      alertSummary = `${worst.property.name} has ${worst.criticalRemaining} critical ${worst.criticalRemaining === 1 ? "issue" : "issues"} still unresolved`;
    }
  }

  return { scanRows, propertyHealthItems, alertSummary };
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
  // noLongerPresent: appeared in scan A but absent from scan B.
  // Could be fixed (internal work done) or verified (confirmed clean by scan B).
  const noLongerPresentViolations = violationsA.filter(
    (violation) => !keysB.has(matchKey(violation)),
  );
  const persistingViolations = violationsB.filter((violation) =>
    keysA.has(matchKey(violation)),
  );

  return {
    scanRunA,
    scanRunB,
    newViolations,
    noLongerPresentViolations,
    persistingViolations,
    summary: {
      newCount: newViolations.length,
      noLongerPresentCount: noLongerPresentViolations.length,
      persistingCount: persistingViolations.length,
      netChange: newViolations.length - noLongerPresentViolations.length,
    },
  };
};
