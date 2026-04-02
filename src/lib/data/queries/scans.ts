import {
  properties,
  pages,
  scanRuns,
  scanPages,
  violations,
  historicalScanSummaries,
} from "../seeds";
import type {
  ScansScreenData,
  ScanRowData,
  ScanPageRowData,
} from "../types/domain";

/**
 * Main query for the Scans / Audit History screen.
 *
 * MVP behavior:
 * - current audits are the live operational entry point into Issues
 * - previous audits are summary-only historical snapshots
 */
export const getScansScreenData = async (): Promise<ScansScreenData> => {
  const propertyMap = new Map(
    properties.map((property) => [property.id, property]),
  );

  const historicalSummaryMap = new Map(
    historicalScanSummaries.map((summary) => [summary.scanRunId, summary]),
  );

  const scansByProperty = new Map<string, typeof scanRuns>();

  for (const scanRun of scanRuns) {
    if (scanRun.status !== "completed") continue;

    const existingScans = scansByProperty.get(scanRun.propertyId) ?? [];
    existingScans.push(scanRun);
    scansByProperty.set(scanRun.propertyId, existingScans);
  }

  for (const propertyScans of scansByProperty.values()) {
    propertyScans.sort(
      (a, b) =>
        new Date(a.initiatedAt).getTime() - new Date(b.initiatedAt).getTime(),
    );
  }

  const currentScanIds = new Set<string>();

  for (const propertyScans of scansByProperty.values()) {
    const latest = propertyScans[propertyScans.length - 1];

    if (latest) {
      currentScanIds.add(latest.id);
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
    const isCurrentScan = currentScanIds.has(scanRun.id);
    const scanType = isCurrentScan ? "Current audit" : "Previous audit";
    const historicalSummary = historicalSummaryMap.get(scanRun.id);

    const scanRunViolations = isCurrentScan
      ? violations.filter((violation) => violation.scanRunId === scanRun.id)
      : [];

    const remainingViolations = isCurrentScan
      ? scanRunViolations.filter(
          (violation) =>
            violation.status === "open" || violation.status === "in-progress",
        )
      : [];

    const pagesForScan: ScanPageRowData[] = isCurrentScan
      ? scanPages
          .filter((scanPage) => scanPage.scanRunId === scanRun.id)
          .map((scanPage) => {
            const pageMetadata = pages.find(
              (page) => page.id === scanPage.pageId,
            );

            if (!pageMetadata) return null;

            return {
              page: pageMetadata,
              totalIssues: scanPage.totalIssues,
              remainingIssues: scanPage.remainingIssues,
              resolvedIssues: scanPage.resolvedIssues,
              criticalRemaining: scanPage.criticalRemaining,
            };
          })
          .filter((row): row is ScanPageRowData => row !== null)
      : [];

    return {
      scanRun,
      property,
      scanType,
      totalIssues: isCurrentScan
        ? scanRunViolations.length
        : (historicalSummary?.totalIssues ?? 0),
      remainingIssues: isCurrentScan
        ? remainingViolations.length
        : (historicalSummary?.remainingIssues ?? 0),
      resolvedIssues: isCurrentScan
        ? scanRunViolations.filter(
            (violation) =>
              violation.status === "fixed" || violation.status === "verified",
          ).length
        : (historicalSummary?.resolvedIssues ?? 0),
      severitySummary: isCurrentScan
        ? {
            critical: remainingViolations.filter((v) => v.impact === "critical")
              .length,
            serious: remainingViolations.filter((v) => v.impact === "serious")
              .length,
            moderate: remainingViolations.filter((v) => v.impact === "moderate")
              .length,
            minor: remainingViolations.filter((v) => v.impact === "minor")
              .length,
          }
        : {
            critical: historicalSummary?.severitySummary?.critical ?? 0,
            serious: historicalSummary?.severitySummary?.serious ?? 0,
            moderate: historicalSummary?.severitySummary?.moderate ?? 0,
            minor: historicalSummary?.severitySummary?.minor ?? 0,
          },
      isHighRisk: isCurrentScan
        ? remainingViolations.some(
            (violation) => violation.impact === "critical",
          )
        : (historicalSummary?.criticalRemaining ?? 0) > 0,
      pages: pagesForScan,
    };
  });

  return {
    scanRows,
    propertyHealthItems: [],
    alertSummary: null,
  };
};
