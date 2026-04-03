import { violations, scanPages, pages, properties, rules, scanRuns, users } from "../seeds";
import { enrichRule } from "./shared";
import type { ViolationInstance, Rule, Page, Property, User } from "../types/domain";

/**
 * A 'Hydrated' violation includes the full objects for its
 * related rule, page, property, and assignee for easier UI rendering.
 */
export type HydratedViolation = ViolationInstance & {
  rule: Rule | undefined;
  page: Page | undefined;
  property: Property | undefined;
  assignee: User | undefined;
};

/**
 * Returns all violations with their associated rule, page, and property
 * details attached directly to the object.
 */
export const getHydratedViolations = async (): Promise<HydratedViolation[]> => {
  // Current audit only: restrict to the latest completed scan run per property
  const currentScanRunIds = new Set<string>();
  for (const property of properties) {
    const latest = scanRuns
      .filter((r) => r.propertyId === property.id && r.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
      )[0];
    if (latest) currentScanRunIds.add(latest.id);
  }

  // Create maps for O(1) lookup performance
  const scanPageMap = new Map(
    scanPages.map((scanPage) => [scanPage.id, scanPage]),
  );

  const pageMap = new Map(pages.map((page) => [page.id, page]));

  const propertyMap = new Map(
    properties.map((property) => [property.id, property]),
  );

  const ruleMap = new Map(rules.map((rule) => [rule.ruleId, enrichRule(rule)]));
  const userMap = new Map(users.map((user) => [user.id, user]));

  return violations
    .filter((v) => currentScanRunIds.has(v.scanRunId))
    .map((violation) => {
      const scanPage = scanPageMap.get(violation.scanPageId);
      const page = scanPage ? pageMap.get(scanPage.pageId) : undefined;
      const property = page ? propertyMap.get(page.propertyId) : undefined;
      const rule = ruleMap.get(violation.ruleId);
      const assignee = violation.assigneeId
        ? userMap.get(violation.assigneeId)
        : undefined;

      return {
        ...violation,
        rule,
        page,
        property,
        assignee,
      };
    });
};

/**
 * Filters hydrated violations for a specific property.
 */
export const getViolationsByProperty = async (
  propertyId: string,
): Promise<HydratedViolation[]> => {
  const allHydrated = await getHydratedViolations();
  return allHydrated.filter(
    (violation) => violation.property?.id === propertyId,
  );
};
