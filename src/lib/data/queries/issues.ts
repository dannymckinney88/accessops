import { violations, scanPages, pages, properties, rules } from "../seeds";
import { enrichRule } from "./shared";
import type { ViolationInstance, Rule, Page, Property } from "../types/domain";

/**
 * A 'Hydrated' violation includes the full objects for its
 * related rule, page, and property for easier UI rendering.
 */
export type HydratedViolation = ViolationInstance & {
  rule: Rule | undefined;
  page: Page | undefined;
  property: Property | undefined;
};

/**
 * Returns all violations with their associated rule, page, and property
 * details attached directly to the object.
 */
export const getHydratedViolations = async (): Promise<HydratedViolation[]> => {
  // Create maps for O(1) lookup performance
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

    return {
      ...violation,
      rule,
      page,
      property,
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
