import type {
  Priority,
  RemediationStatus,
  Severity,
  ViolationInstance,
} from "@/types/domain";

type ViolationSeed = {
  scanPageId: string;
  scanRunId: string;
  ruleId: string;
  count: number;
  impact: Severity;
  status: RemediationStatus;
  priority?: Priority;
};

type ScanRunDates = {
  firstSeenAt: string;
  lastSeenAt: string;
};

type RuleTemplate = {
  html: string;
  failureSummary: string;
  targetBase: string;
};

const scanRunDatesById: Record<string, ScanRunDates> = {
  "sr-mkt-baseline": {
    firstSeenAt: "2024-09-15T09:00:00Z",
    lastSeenAt: "2025-02-15T09:00:00Z",
  },
  "sr-mkt-rescan": {
    firstSeenAt: "2024-09-15T09:00:00Z",
    lastSeenAt: "2025-02-15T09:00:00Z",
  },
  "sr-loan-baseline": {
    firstSeenAt: "2024-09-18T09:00:00Z",
    lastSeenAt: "2025-01-30T09:00:00Z",
  },
  "sr-loan-rescan": {
    firstSeenAt: "2025-01-30T09:00:00Z",
    lastSeenAt: "2025-01-30T09:00:00Z",
  },
  "sr-dash-baseline": {
    firstSeenAt: "2024-09-20T09:00:00Z",
    lastSeenAt: "2025-03-10T09:00:00Z",
  },
  "sr-dash-rescan": {
    firstSeenAt: "2024-09-20T09:00:00Z",
    lastSeenAt: "2025-03-10T09:00:00Z",
  },
  "sr-sup-baseline": {
    firstSeenAt: "2024-10-01T09:00:00Z",
    lastSeenAt: "2024-10-01T09:00:00Z",
  },
};

const ruleTemplates: Record<string, RuleTemplate> = {
  "image-alt": {
    html: '<img src="hero.jpg">',
    failureSummary: "Image has no alternative text.",
    targetBase: ".img-target",
  },
  "color-contrast": {
    html: '<button class="action-btn">Next Step</button>',
    failureSummary: "Insufficient color contrast.",
    targetBase: ".contrast-target",
  },
  label: {
    html: '<input type="text">',
    failureSummary: "Form element has no associated label.",
    targetBase: ".label-target",
  },
  "scope-attr-valid": {
    html: '<th scope="row">Date</th>',
    failureSummary: "Invalid scope attribute on table header.",
    targetBase: ".scope-target",
  },
  "heading-order": {
    html: "<h4>Related Link</h4>",
    failureSummary: "Heading order skips levels.",
    targetBase: ".heading-target",
  },
};

const getPriority = (impact: Severity): Priority => {
  if (impact === "critical") return "high";
  if (impact === "serious") return "medium";
  return "low";
};

const buildViolations = (seed: ViolationSeed): ViolationInstance[] => {
  const dates = scanRunDatesById[seed.scanRunId];
  const template = ruleTemplates[seed.ruleId];

  return Array.from({ length: seed.count }, (_, index) => ({
    id: `v-${seed.scanPageId}-${seed.ruleId}-${index}`,
    scanRunId: seed.scanRunId,
    scanPageId: seed.scanPageId,
    ruleId: seed.ruleId,
    impact: seed.impact,
    status: seed.status,
    priority: seed.priority ?? getPriority(seed.impact),
    firstSeenAt: dates.firstSeenAt,
    lastSeenAt: dates.lastSeenAt,
    html: template.html,
    target: [`${template.targetBase}-${index + 1}`],
    failureSummary: `${template.failureSummary} Instance ${index + 1}.`,
  }));
};

const violationRegistry: ViolationSeed[] = [
  /**
   * Marketing Site — Improvement
   * Baseline findings remain in the system, but most are now verified/fixed.
   */
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 5,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "fixed",
  },
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "label",
    count: 1,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    ruleId: "image-alt",
    count: 1,
    impact: "serious",
    status: "open",
  },

  /**
   * Loan Application — Regression
   * Baseline already has meaningful blockers, then Financial Data regresses hard.
   */
  {
    scanPageId: "sp-loan-b-info",
    scanRunId: "sr-loan-baseline",
    ruleId: "label",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-fin",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-sub",
    scanRunId: "sr-loan-baseline",
    ruleId: "label",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-info",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-fin",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 12,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-sub",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 2,
    impact: "critical",
    status: "open",
  },

  /**
   * Customer Dashboard — Stagnation
   * Some effort exists, but the hardest table problems remain.
   */
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "scope-attr-valid",
    count: 2,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "scope-attr-valid",
    count: 8,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-stmt",
    scanRunId: "sr-dash-baseline",
    ruleId: "label",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "scope-attr-valid",
    count: 2,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "scope-attr-valid",
    count: 8,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-stmt",
    scanRunId: "sr-dash-rescan",
    ruleId: "label",
    count: 1,
    impact: "critical",
    status: "open",
  },

  /**
   * Support Center — Neglected
   * Smaller backlog, low priority, no follow-up audit.
   */
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 4,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-faq",
    scanRunId: "sr-sup-baseline",
    ruleId: "label",
    count: 2,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-acc",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
];

export const violations: ViolationInstance[] =
  violationRegistry.flatMap(buildViolations);
