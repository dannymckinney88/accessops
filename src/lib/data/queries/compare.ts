import { scanRuns } from "../seeds";
import { getHydratedViolations, type HydratedViolation } from "./issues";

export interface ScanComparison {
  scanRunA: (typeof scanRuns)[0] | undefined;
  scanRunB: (typeof scanRuns)[0] | undefined;
  newViolations: HydratedViolation[];
  resolvedViolations: HydratedViolation[];
  persistingViolations: HydratedViolation[];
}

/**
 * Compares two scan runs to identify changes in accessibility health.
 * No shorthands used (v, sr, r, etc).
 */
export const getScanComparison = async (
  scanRunIdA: string,
  scanRunIdB: string,
): Promise<ScanComparison> => {
  const scanRunA = scanRuns.find((scanRun) => scanRun.id === scanRunIdA);
  const scanRunB = scanRuns.find((scanRun) => scanRun.id === scanRunIdB);

  const allHydratedViolations = await getHydratedViolations();

  const violationsFromScanA = allHydratedViolations.filter(
    (violation) => violation.scanRunId === scanRunIdA,
  );
  const violationsFromScanB = allHydratedViolations.filter(
    (violation) => violation.scanRunId === scanRunIdB,
  );

  /**
   * Generates a unique key for a violation based on its rule and the element location (target).
   * This allows us to track the "same" issue across different time periods.
   */
  const createComparisonKey = (violation: HydratedViolation) =>
    `${violation.ruleId}::${violation.target[0] ?? "unknown-selector"}`;

  const keysFromScanA = new Set(violationsFromScanA.map(createComparisonKey));
  const keysFromScanB = new Set(violationsFromScanB.map(createComparisonKey));

  // 1. New: Present in Scan B, but were never in Scan A.
  const newViolations = violationsFromScanB.filter(
    (violation) => !keysFromScanA.has(createComparisonKey(violation)),
  );

  // 2. Resolved: Present in Scan A, but gone in Scan B.
  const resolvedViolations = violationsFromScanA.filter(
    (violation) => !keysFromScanB.has(createComparisonKey(violation)),
  );

  // 3. Persisting: Present in both scans (the "backlog").
  const persistingViolations = violationsFromScanB.filter((violation) =>
    keysFromScanA.has(createComparisonKey(violation)),
  );

  return {
    scanRunA,
    scanRunB,
    newViolations,
    resolvedViolations,
    persistingViolations,
  };
};
