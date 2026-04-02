import type { HydratedViolation, Page, Property, Rule } from "@/lib/data/index";
import type { Priority, RemediationStatus, Severity } from "@/lib/data/types/domain";

export type AggregatedIssue = {
  id: string;
  ruleId: string;
  rule: Rule | undefined;
  severity: Severity;
  status: RemediationStatus;
  priority: Priority;
  totalInstances: number;
  affectedPagesCount: number;
  affectedPages: Page[];
  affectedProperties: Property[];
  affectedPropertiesCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  instances: HydratedViolation[];
  sampleInstance: HydratedViolation;
};

const severityOrder: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const statusOrder: Record<RemediationStatus, number> = {
  open: 0,
  "in-progress": 1,
  fixed: 2,
  verified: 3,
  "accepted-risk": 4,
};

const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const aggregateIssues = (
  violations: HydratedViolation[],
): AggregatedIssue[] => {
  const groups = new Map<string, HydratedViolation[]>();

  for (const violation of violations) {
    const existing = groups.get(violation.ruleId);
    if (existing) {
      existing.push(violation);
    } else {
      groups.set(violation.ruleId, [violation]);
    }
  }

  return Array.from(groups.entries()).map(([ruleId, instances]) => {
    const sortedBySeverity = [...instances].sort(
      (a, b) => severityOrder[a.impact] - severityOrder[b.impact],
    );
    const sortedByStatus = [...instances].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status],
    );
    const sortedByPriority = [...instances].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
    const sortedByFirstSeen = [...instances].sort(
      (a, b) =>
        new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime(),
    );
    const sortedByLastSeen = [...instances].sort(
      (a, b) =>
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
    );

    const pageMap = new Map<string, Page>();
    const propertyMap = new Map<string, Property>();

    for (const instance of instances) {
      if (instance.page) pageMap.set(instance.page.id, instance.page);
      if (instance.property) propertyMap.set(instance.property.id, instance.property);
    }

    return {
      id: ruleId,
      ruleId,
      rule: sortedBySeverity[0]?.rule,
      severity: sortedBySeverity[0]?.impact ?? "minor",
      status: sortedByStatus[0]?.status ?? "open",
      priority: sortedByPriority[0]?.priority ?? "low",
      totalInstances: instances.length,
      affectedPagesCount: pageMap.size,
      affectedPages: Array.from(pageMap.values()),
      affectedProperties: Array.from(propertyMap.values()),
      affectedPropertiesCount: propertyMap.size,
      firstSeenAt: sortedByFirstSeen[0]?.firstSeenAt ?? new Date().toISOString(),
      lastSeenAt: sortedByLastSeen[0]?.lastSeenAt ?? new Date().toISOString(),
      instances,
      sampleInstance: sortedBySeverity[0] ?? instances[0],
    };
  });
};
