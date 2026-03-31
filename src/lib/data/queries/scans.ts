import { properties, pages, scanRuns, scanPages, violations } from "../seeds";
import type {
  ScansScreenData,
  ScanRowData,
  PropertyHealthItem,
} from "../types/domain";

/**
 * Main query for the Scans / Audit History screen.
 * Groups scan data, determines baselines vs rescans, and calculates health trends.
 */
export const getScansScreenData = async (): Promise<ScansScreenData> => {
  const propertyMap = new Map(
    properties.map((property) => [property.id, property]),
  );

  // Group completed scans by property to determine which is the 'Baseline'
  const scansByProperty = new Map<string, typeof scanRuns>();
  for (const scanRun of scanRuns) {
    if (scanRun.status !== "completed") continue;

    const existingScans = scansByProperty.get(scanRun.propertyId) ?? [];
    existingScans.push(scanRun);
    scansByProperty.set(scanRun.propertyId, existingScans);
  }

  // A Baseline is the oldest completed scan for a property
  const baselineScanIds = new Set<string>();
  for (const propertyScans of scansByProperty.values()) {
    propertyScans.sort(
      (a, b) =>
        new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
    );
    if (propertyScans[0]) {
      baselineScanIds.add(propertyScans[0].id);
    }
  }

  const completedRuns = scanRuns
    .filter((scanRun) => scanRun.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
    );

  const scanRows: ScanRowData[] = completedRuns.map((scanRun) => {
    const property = propertyMap.get(scanRun.propertyId)!;
    const isBaseline = baselineScanIds.has(scanRun.id);
    const scanType = isBaseline ? "Baseline" : "Rescan";

    const scanRunViolations = violations.filter(
      (violation) => violation.scanRunId === scanRun.id,
    );

    const remainingViolations = scanRunViolations.filter(
      (violation) =>
        violation.status === "open" || violation.status === "in-progress",
    );

    return {
      scanRun,
      property,
      scanType,
      totalIssues: scanRunViolations.length,
      remainingIssues: remainingViolations.length,
      resolvedIssues: scanRunViolations.filter(
        (violation) =>
          violation.status === "fixed" || violation.status === "verified",
      ).length,
      severitySummary: {
        critical: remainingViolations.filter((v) => v.impact === "critical")
          .length,
        serious: remainingViolations.filter((v) => v.impact === "serious")
          .length,
        moderate: remainingViolations.filter((v) => v.impact === "moderate")
          .length,
        minor: remainingViolations.filter((v) => v.impact === "minor").length,
      },
      isHighRisk: remainingViolations.some(
        (violation) => violation.impact === "critical",
      ),
      pages: [], // This can be populated with ScanPageRowData if needed
    };
  });

  // Generate Property Health Items for the top horizontal scroll bar
  const propertyHealthItems: PropertyHealthItem[] = Array.from(
    scansByProperty.entries(),
  ).map(([propertyId, propertyScans]) => {
    const property = propertyMap.get(propertyId)!;
    const latestScan = propertyScans[propertyScans.length - 1];

    const latestViolations = violations.filter(
      (violation) => violation.scanRunId === latestScan.id,
    );

    const latestRemaining = latestViolations.filter(
      (violation) =>
        violation.status === "open" || violation.status === "in-progress",
    );

    let trend: PropertyHealthItem["trend"] = "insufficient-data";
    if (propertyScans.length >= 2) {
      const currentCount = latestViolations.length;
      const previousScanId = propertyScans[propertyScans.length - 2].id;
      const previousCount = violations.filter(
        (violation) => violation.scanRunId === previousScanId,
      ).length;

      if (currentCount < previousCount) trend = "improving";
      else if (currentCount > previousCount) trend = "regressing";
      else trend = "stable";
    }

    return {
      property,
      trend,
      remainingIssues: latestRemaining.length,
      criticalRemaining: latestRemaining.filter(
        (violation) => violation.impact === "critical",
      ).length,
    };
  });

  return {
    scanRows,
    propertyHealthItems: propertyHealthItems.sort(
      (a, b) => b.remainingIssues - a.remainingIssues,
    ),
    alertSummary: null,
  };
};
