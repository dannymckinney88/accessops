// src/lib/data/violations.ts
//
// Violations are generated from a seed registry.
// Each seed entry maps a scanPageId + ruleId + count → N ViolationInstances.
// Statuses are intentional: they drive all dashboard, scans, and issues counts.
//
// Dashboard targets this data produces:
//   Unfixed: 37 (Critical 19 · Serious 16 · Moderate 2)
//   Fixed:    7
//   Verified: 4
//
// Property stories:
//   Marketing Site     — Improving   (rescan 3 < baseline 7)
//   Loan Application   — Regressing  (rescan 14 > baseline 4)
//   Customer Dashboard — Stable      (rescan 7 == baseline 7, persistent high-risk debt)
//   Support Center     — Insufficient data (no rescan; issues unaddressed)

import type { ViolationInstance } from "@/lib/data/types/domain";

// ─── Seed types ──────────────────────────────────────────────────────────────

type ViolationSeed = {
  scanPageId: string;
  scanRunId: string;
  ruleId: string;
  count: number;
  impact: ViolationInstance["impact"];
  status: ViolationInstance["status"];
};

// ─── Per-scan date windows ────────────────────────────────────────────────────

const scanDates: Record<string, { firstSeenAt: string; lastSeenAt: string }> = {
  "sr-mkt-baseline": {
    firstSeenAt: "2024-09-15T09:00:00.000Z",
    lastSeenAt: "2024-09-15T09:18:33.000Z",
  },
  "sr-mkt-rescan": {
    firstSeenAt: "2025-02-12T10:00:00.000Z",
    lastSeenAt: "2025-02-12T10:14:47.000Z",
  },
  "sr-loan-baseline": {
    firstSeenAt: "2024-09-18T09:00:00.000Z",
    lastSeenAt: "2024-09-18T09:21:04.000Z",
  },
  "sr-loan-rescan": {
    firstSeenAt: "2025-01-30T09:00:00.000Z",
    lastSeenAt: "2025-01-30T09:23:51.000Z",
  },
  "sr-dash-baseline": {
    firstSeenAt: "2024-09-20T09:00:00.000Z",
    lastSeenAt: "2024-09-20T09:24:16.000Z",
  },
  "sr-dash-rescan": {
    firstSeenAt: "2025-03-05T09:00:00.000Z",
    lastSeenAt: "2025-03-05T09:22:38.000Z",
  },
  "sr-sup-baseline": {
    firstSeenAt: "2024-09-22T09:00:00.000Z",
    lastSeenAt: "2024-09-22T09:16:29.000Z",
  },
};

// ─── Rule HTML/target templates ──────────────────────────────────────────────

const ruleTemplates: Record<
  string,
  { html: string; failureSummary: string; targetBase: string }
> = {
  "color-contrast": {
    html: '<p class="body-text">Insufficient contrast text</p>',
    failureSummary:
      "Element has insufficient color contrast of 3.1:1 (foreground: #767676, background: #ffffff, expected 4.5:1).",
    targetBase: ".contrast-target",
  },
  "image-alt": {
    html: '<img src="/assets/promo.jpg" class="promo-image">',
    failureSummary: "Element does not have an alt attribute.",
    targetBase: ".img-target",
  },
  label: {
    html: '<input type="text" class="form-input" placeholder="Enter value">',
    failureSummary:
      "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
    targetBase: ".input-target",
  },
  "button-name": {
    html: '<button type="button"><svg aria-hidden="true" focusable="false"></svg></button>',
    failureSummary:
      "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
    targetBase: ".btn-target",
  },
  "link-name": {
    html: '<a href="/learn-more"><svg aria-hidden="true"></svg></a>',
    failureSummary:
      "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
    targetBase: ".link-target",
  },
  "td-headers-attr": {
    html: '<td class="amount-cell">$2,340.00</td>',
    failureSummary:
      "Cell does not refer to an existing table header. Fix any of the following: the headers attribute references an id that does not exist.",
    targetBase: ".td-target",
  },
  "autocomplete-valid": {
    html: '<input type="text" autocomplete="name" class="form-input">',
    failureSummary:
      "autocomplete attribute is incorrectly used. Fix any of the following: the autocomplete value 'name' is not appropriate for this input type.",
    targetBase: ".autocomplete-target",
  },
  "heading-order": {
    html: "<h4>Section Subtitle</h4>",
    failureSummary:
      "Heading order invalid. Fix any of the following: heading skips from h2 to h4.",
    targetBase: ".heading-target",
  },
};

const getPriority = (
  impact: ViolationInstance["impact"],
): ViolationInstance["priority"] => {
  if (impact === "critical") return "high";
  if (impact === "serious") return "medium";
  return "low";
};

const buildViolations = (seed: ViolationSeed): ViolationInstance[] => {
  const dates = scanDates[seed.scanRunId] ?? {
    firstSeenAt: "2024-09-01T09:00:00.000Z",
    lastSeenAt: "2024-09-01T09:00:00.000Z",
  };
  const tpl = ruleTemplates[seed.ruleId] ?? {
    html: `<element class="${seed.ruleId}-element">`,
    failureSummary: `${seed.ruleId} violation.`,
    targetBase: `.${seed.ruleId}-target`,
  };

  return Array.from({ length: seed.count }, (_, i) => ({
    id: `v-${seed.scanPageId}-${seed.ruleId}-${i + 1}`,
    scanRunId: seed.scanRunId,
    scanPageId: seed.scanPageId,
    ruleId: seed.ruleId,
    impact: seed.impact,
    status: seed.status,
    priority: getPriority(seed.impact),
    firstSeenAt: dates.firstSeenAt,
    lastSeenAt: dates.lastSeenAt,
    html: tpl.html,
    target: [`${tpl.targetBase}-${i + 1}`],
    failureSummary: tpl.failureSummary,
  }));
};

// ─── Violation registry ───────────────────────────────────────────────────────
//
// Unfixed (open/in-progress) counts by property:
//   Marketing Site     — 3  unfixed (0 critical, 3 serious)
//   Loan Application   — 17 unfixed (10 critical, 6 serious, 1 moderate)
//   Customer Dashboard — 12 unfixed (7 critical, 4 serious, 1 moderate)
//   Support Center     —  5 unfixed (2 critical, 3 serious)
//   ─────────────────────────────────────────────────────
//   Total              — 37 unfixed · 19 critical · 16 serious · 2 moderate
//   Fixed: 7 · Verified: 4

const violationRegistry: ViolationSeed[] = [
  // ── Marketing Site — Baseline ─────────────────────────────────────────────
  // sp-mkt-b-home (4): 2 verified/serious, 1 fixed/critical, 1 open/serious
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "fixed",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-mkt-b-personal (3): 2 verified/serious, 1 fixed/moderate
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "autocomplete-valid",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ── Marketing Site — Rescan ──────────────────────────────────────────────
  // sp-mkt-r-home (2): 2 open/serious — remaining after improvement push
  {
    scanPageId: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "open",
  },

  // sp-mkt-r-personal (1): 1 fixed/moderate — addressed immediately after rescan
  {
    scanPageId: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ── Loan Application — Baseline ───────────────────────────────────────────
  // Pre-regression: existing form and contrast issues, limited remediation.
  // sp-loan-b-personal (2): 1 open/serious, 1 fixed/serious
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "fixed",
  },

  // sp-loan-b-employment (1): 1 open/serious
  {
    scanPageId: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-loan-b-review (1): 1 open/moderate
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "autocomplete-valid",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Loan Application — Rescan (REGRESSION) ───────────────────────────────
  // November 2024 deploy broke label associations across the entire form flow.
  // All 14 violations are open — crisis response in progress.
  // sp-loan-r-personal (5): 3 open/critical, 2 open/serious
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "open",
  },

  // sp-loan-r-employment (5): 4 open/critical, 1 open/serious
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-loan-r-review (4): 3 open/critical, 1 open/serious
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // ── Customer Dashboard — Baseline ─────────────────────────────────────────
  // Persistent high-risk debt. Table structure and button accessibility failures.
  // sp-dash-b-overview (2): 1 in-progress/critical, 1 open/serious
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-dash-b-accounts (2): 1 fixed/serious, 1 open/critical
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "fixed",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 1,
    impact: "critical",
    status: "open",
  },

  // sp-dash-b-txn (3): 1 fixed/moderate, 2 open/critical
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "autocomplete-valid",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 2,
    impact: "critical",
    status: "open",
  },

  // ── Customer Dashboard — Rescan (STABLE / STAGNANT) ───────────────────────
  // Same violation count as baseline. Team made minimal progress.
  // sp-dash-r-overview (2): 1 open/critical, 1 open/serious
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-dash-r-accounts (2): 1 open/critical, 1 open/serious
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-dash-r-txn (3): 1 open/critical, 1 open/serious, 1 open/moderate
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Support Center — Baseline ─────────────────────────────────────────────
  // No rescan. Lower-volume backlog with no remediation activity.
  // sp-sup-b-home (2): 1 open/critical, 1 open/serious
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-sup-b-accounts (2): 1 open/critical, 1 open/serious
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },

  // sp-sup-b-contact (2): 1 fixed/serious, 1 open/serious
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "fixed",
  },
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
];

export const violations: ViolationInstance[] =
  violationRegistry.flatMap(buildViolations);
