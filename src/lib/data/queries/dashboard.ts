import { properties, scanRuns, violations, scanPages, pages } from "../seeds";
import type {
  PropertyHealthSummary,
  DashboardCurrentState,
  DashboardSummary,
  SeverityDistributionPoint,
} from "../types/domain";

/**
 * Returns summary rows for the dashboard property health table.
 */
export const getPropertyHealthSummaries = async (): Promise<
  PropertyHealthSummary[]
> => {
  return properties.map((property) => {
    // Get completed scans for this specific property
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

    // Filter violations belonging only to this property's scan history
    const propertyScanIds = new Set(propertyScans.map((scanRun) => scanRun.id));
    const propertyViolations = violations.filter((violation) =>
      propertyScanIds.has(violation.scanRunId),
    );

    // Identify issues that are currently active (not fixed)
    const unfixedViolations = propertyViolations.filter(
      (violation) =>
        violation.status === "open" || violation.status === "in-progress",
    );

    // Calculate the health trend by comparing the two most recent scans
    let trend: PropertyHealthSummary["trend"] = "insufficient-data";
    if (propertyScans.length >= 2) {
      const latestViolationCount = violations.filter(
        (violation) => violation.scanRunId === propertyScans[0]!.id,
      ).length;
      const previousViolationCount = violations.filter(
        (violation) => violation.scanRunId === propertyScans[1]!.id,
      ).length;

      if (latestViolationCount < previousViolationCount) trend = "improving";
      else if (latestViolationCount > previousViolationCount)
        trend = "regressing";
      else trend = "stable";
    }

    return {
      property,
      latestScanRun,
      totalViolations: propertyViolations.length,
      criticalCount: unfixedViolations.filter(
        (violation) => violation.impact === "critical",
      ).length,
      seriousCount: propertyViolations.filter(
        (violation) => violation.impact === "serious",
      ).length,
      unfixedCount: unfixedViolations.length,
      trend,
    };
  });
};

/**
 * Aggregates all current audit state KPIs for the dashboard.
 */
export const getDashboardCurrentState =
  async (): Promise<DashboardCurrentState> => {
    const healthSummaries = await getPropertyHealthSummaries();

    const unfixedViolations = violations.filter(
      (violation) =>
        violation.status === "open" || violation.status === "in-progress",
    );

    // Create the chart data for severity distribution
    const severityDistribution: SeverityDistributionPoint[] = [
      {
        severity: "Critical",
        count: unfixedViolations.filter(
          (violation) => violation.impact === "critical",
        ).length,
      },
      {
        severity: "Serious",
        count: unfixedViolations.filter(
          (violation) => violation.impact === "serious",
        ).length,
      },
      {
        severity: "Moderate",
        count: unfixedViolations.filter(
          (violation) => violation.impact === "moderate",
        ).length,
      },
      {
        severity: "Minor",
        count: unfixedViolations.filter(
          (violation) => violation.impact === "minor",
        ).length,
      },
    ];

    // Helper maps for efficient lookups
    const scanRunToPropertyMap = new Map(
      scanRuns.map((run) => [run.id, run.propertyId]),
    );
    const scanPageToPageMap = new Map(
      scanPages.map((scanPage) => [scanPage.id, scanPage.pageId]),
    );
    const propertyIdToNameMap = new Map(
      properties.map((property) => [property.id, property.name]),
    );

    // Identify top critical pages across the entire organization
    const criticalUnfixedViolations = unfixedViolations.filter(
      (violation) => violation.impact === "critical",
    );
    const pageCriticalCounts = new Map<string, number>();

    for (const violation of criticalUnfixedViolations) {
      const pageId = scanPageToPageMap.get(violation.scanPageId);
      if (pageId) {
        pageCriticalCounts.set(
          pageId,
          (pageCriticalCounts.get(pageId) ?? 0) + 1,
        );
      }
    }

    const topCriticalPages = [...pageCriticalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([pageId, count]) => {
        const pageRecord = pages.find(
          (currentPage) => currentPage.id === pageId,
        );
        return {
          pageId,
          pageTitle: pageRecord?.title ?? pageId,
          pagePath: pageRecord?.path ?? "",
          propertyName: pageRecord
            ? (propertyIdToNameMap.get(pageRecord.propertyId) ?? "")
            : "",
          criticalCount: count,
        };
      });

    return {
      totalViolations: violations.length,
      criticalCount: criticalUnfixedViolations.length,
      highSeverityCount:
        severityDistribution[0].count + severityDistribution[1].count,
      propertyCount: healthSummaries.length,
      propertiesWithIssues: new Set(
        unfixedViolations.map((violation) =>
          scanRunToPropertyMap.get(violation.scanRunId),
        ),
      ).size,
      propertiesWithCritical: new Set(
        criticalUnfixedViolations.map((violation) =>
          scanRunToPropertyMap.get(violation.scanRunId),
        ),
      ).size,
      regressingCount: healthSummaries.filter(
        (summary) => summary.trend === "regressing",
      ).length,
      unfixedCount: unfixedViolations.length,
      openCount: violations.filter((violation) => violation.status === "open")
        .length,
      inProgressCount: violations.filter(
        (violation) => violation.status === "in-progress",
      ).length,
      fixedCount: violations.filter((violation) => violation.status === "fixed")
        .length,
      verifiedCount: violations.filter(
        (violation) => violation.status === "verified",
      ).length,
      acceptedRiskCount: violations.filter(
        (violation) => violation.status === "accepted-risk",
      ).length,
      severityDistribution,
      propertyHealthSummaries: healthSummaries,
      topCriticalRule: null,
      topCriticalPages,
      severityByProperty: [],
    };
  };

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  return getDashboardCurrentState();
};
