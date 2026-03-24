// src/lib/data/violations.ts
//
// Violations are generated deterministically from a structured config.
// No randomness. Every violation is traceable to a scanPage + rule assignment.
//
// Generator config shape:
//   - scanPageId       — which scan page this violation appears on
//   - ruleId           — which rule fired
//   - impact           — instance-level severity
//   - status           — remediation status
//   - priority         — triage priority
//   - firstSeenAt      — ISO date of first appearance across scan history
//   - lastSeenAt       — ISO date of most recent appearance
//   - failureSummary   — human-readable explanation (mirrors real axe output)
//   - html             — failing element snippet
//   - target           — CSS selector path
//   - notes            — optional remediation notes

import type { ViolationInstance } from "@/types/domain";

// ─── Generator utility ───────────────────────────────────────────────────────

let counter = 0;

const vid = (): string => {
  counter += 1;
  return `v-${String(counter).padStart(4, "0")}`;
};

type NewViolation = Omit<ViolationInstance, "id">;

const createViolation = (partial: NewViolation): ViolationInstance => {
  return { id: vid(), ...partial };
};

// ─── Marketing Site violations ───────────────────────────────────────────────
// Story: Improving. color-contrast and image-alt dominate early scans.
// Each successive scan sees fewer recurrences and more resolved statuses.

const marketingViolations: ViolationInstance[] = [
  // Scan 1 — baseline, all open
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-home",
    ruleId: "image-alt",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2024-12-01T09:00:00.000Z",
    html: '<img src="/assets/hero-banner.jpg" class="hero-image">',
    target: [".hero-section .hero-image"],
    failureSummary:
      "Fix any of the following: Element does not have an alt attribute. Element has no title attribute.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2024-11-01T09:00:00.000Z",
    html: "<h3>Our Products</h3>",
    target: [".products-section h3"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h3 follows h1 with no h2 in between.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-personal",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-02-03T09:00:00.000Z",
    html: '<p class="feature-description">No hidden fees. Ever.</p>',
    target: [".features-grid .feature-description"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.8:1 (foreground: #888888, background: #f5f5f5). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-personal",
    ruleId: "link-name",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2024-12-01T09:00:00.000Z",
    html: '<a href="/personal/checking"><img src="/icons/arrow.svg"></a>',
    target: [".product-card a"],
    failureSummary:
      "Fix any of the following: Element does not have text that is visible to screen readers. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-loans",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<span class="rate-label">APR from</span>',
    target: [".loan-rates-table .rate-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 2.9:1 (foreground: #999999, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-loans",
    ruleId: "image-alt",
    impact: "critical",
    status: "in-progress",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2024-11-01T09:00:00.000Z",
    html: '<img src="/assets/loan-types-diagram.png">',
    target: [".loan-types .diagram-image"],
    failureSummary:
      "Fix any of the following: Element does not have an alt attribute.",
    notes: "Adding alt text in next sprint. Designer providing copy.",
  }),
  createViolation({
    scanRunId: "sr-mkt-1",
    scanPageId: "sp-mkt1-contact",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2024-12-01T09:00:00.000Z",
    html: '<input type="text" placeholder="Your name" name="contactName">',
    target: ["#contact-form input[name='contactName']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),

  // Scan 2 — some resolved, color-contrast persists
  createViolation({
    scanRunId: "sr-mkt-2",
    scanPageId: "sp-mkt2-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Design token update in review — PR #441.",
  }),
  createViolation({
    scanRunId: "sr-mkt-2",
    scanPageId: "sp-mkt2-personal",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-02-03T09:00:00.000Z",
    html: '<p class="feature-description">No hidden fees. Ever.</p>',
    target: [".features-grid .feature-description"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.8:1 (foreground: #888888, background: #f5f5f5). Expected contrast ratio of 4.5:1.",
    notes: "Updating muted text tokens globally.",
  }),
  createViolation({
    scanRunId: "sr-mkt-2",
    scanPageId: "sp-mkt2-loans",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<span class="rate-label">APR from</span>',
    target: [".loan-rates-table .rate-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 2.9:1 (foreground: #999999, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),

  // Scan 3 — further reduction, heading-order resolved
  createViolation({
    scanRunId: "sr-mkt-3",
    scanPageId: "sp-mkt3-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "high",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Design token update in review — PR #441.",
  }),
  createViolation({
    scanRunId: "sr-mkt-3",
    scanPageId: "sp-mkt3-loans",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<span class="rate-label">APR from</span>',
    target: [".loan-rates-table .rate-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 2.9:1 (foreground: #999999, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Included in design token pass.",
  }),

  // Scans 4-6 — nearing clean, only persistent color-contrast remains
  createViolation({
    scanRunId: "sr-mkt-4",
    scanPageId: "sp-mkt4-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Token update shipped to staging. Pending prod deploy.",
  }),
  createViolation({
    scanRunId: "sr-mkt-5",
    scanPageId: "sp-mkt5-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Prod deploy scheduled for next sprint.",
  }),
  createViolation({
    scanRunId: "sr-mkt-6",
    scanPageId: "sp-mkt6-home",
    ruleId: "color-contrast",
    impact: "serious",
    status: "in-progress",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<a class="cta-button" href="/apply">Apply Now</a>',
    target: [".hero-section .cta-button"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff). Expected contrast ratio of 4.5:1.",
    notes: "Prod deploy in progress.",
  }),
  createViolation({
    scanRunId: "sr-mkt-6",
    scanPageId: "sp-mkt6-loans",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:00:00.000Z",
    lastSeenAt: "2025-03-03T09:00:00.000Z",
    html: '<span class="rate-label">APR from</span>',
    target: [".loan-rates-table .rate-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 2.9:1 (foreground: #999999, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
];

// ─── Loan Application violations ─────────────────────────────────────────────
// Story: Regressing. Stable scans 1-3. Deploy at scan 4 introduces
// label and autocomplete failures across personal-info and employment steps.
// Scans 5-6 show no recovery — issues compounding.

const loanViolations: ViolationInstance[] = [
  // Scans 1-3 — stable baseline issues
  createViolation({
    scanRunId: "sr-loan-1",
    scanPageId: "sp-loan1-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="middleName" placeholder="Middle name">',
    target: ["#personal-info-form input[name='middleName']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-loan-1",
    scanPageId: "sp-loan1-employment",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="number" name="monthlyIncome" placeholder="Monthly income">',
    target: ["#employment-form input[name='monthlyIncome']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-loan-1",
    scanPageId: "sp-loan1-start",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<p class="helper-text">Check your rate in 2 minutes — no impact to your credit score.</p>',
    target: [".application-intro .helper-text"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.6:1 (foreground: #777777, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-loan-2",
    scanPageId: "sp-loan2-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="middleName" placeholder="Middle name">',
    target: ["#personal-info-form input[name='middleName']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-loan-2",
    scanPageId: "sp-loan2-employment",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="number" name="monthlyIncome" placeholder="Monthly income">',
    target: ["#employment-form input[name='monthlyIncome']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-loan-3",
    scanPageId: "sp-loan3-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:05:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="middleName" placeholder="Middle name">',
    target: ["#personal-info-form input[name='middleName']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),

  // Scan 4 — deploy regression spike
  // New form component shipped without label associations or autocomplete attrs
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="email" name="email" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='email']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>. aria-label attribute does not exist or is empty.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-personal",
    ruleId: "autocomplete-valid",
    impact: "serious",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="firstName" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='firstName']"],
    failureSummary:
      "Fix any of the following: Expected autocomplete attribute to be 'given-name' but got no value. autocomplete attribute and target field type do not match.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-personal",
    ruleId: "autocomplete-valid",
    impact: "serious",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="lastName" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='lastName']"],
    failureSummary:
      "Fix any of the following: Expected autocomplete attribute to be 'family-name' but got no value.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="date" name="dob" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='dob']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-employment",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="employerName" class="vf-input">',
    target: ["#employment-form .vf-input[name='employerName']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-employment",
    ruleId: "select-name",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<select name="employmentStatus" class="vf-select"></select>',
    target: ["#employment-form .vf-select[name='employmentStatus']"],
    failureSummary:
      "Fix any of the following: Select element does not have an accessible name. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-loan-4",
    scanPageId: "sp-loan4-review",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<span class="review-label">Loan amount</span>',
    target: [".review-summary .review-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.1:1 (foreground: #7a7a7a, background: #f8f8f8). Expected contrast ratio of 4.5:1.",
  }),

  // Scans 5-6 — no recovery, same issues persist plus new ones
  createViolation({
    scanRunId: "sr-loan-5",
    scanPageId: "sp-loan5-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="email" name="email" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='email']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-loan-5",
    scanPageId: "sp-loan5-personal",
    ruleId: "autocomplete-valid",
    impact: "serious",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="firstName" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='firstName']"],
    failureSummary:
      "Fix any of the following: Expected autocomplete attribute to be 'given-name' but got no value.",
  }),
  createViolation({
    scanRunId: "sr-loan-5",
    scanPageId: "sp-loan5-employment",
    ruleId: "select-name",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<select name="employmentStatus" class="vf-select"></select>',
    target: ["#employment-form .vf-select[name='employmentStatus']"],
    failureSummary:
      "Fix any of the following: Select element does not have an accessible name.",
  }),
  createViolation({
    scanRunId: "sr-loan-6",
    scanPageId: "sp-loan6-personal",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="email" name="email" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='email']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-loan-6",
    scanPageId: "sp-loan6-personal",
    ruleId: "autocomplete-valid",
    impact: "serious",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<input type="text" name="firstName" class="vf-input">',
    target: ["#personal-info-form .vf-input[name='firstName']"],
    failureSummary:
      "Fix any of the following: Expected autocomplete attribute to be 'given-name' but got no value.",
  }),
  createViolation({
    scanRunId: "sr-loan-6",
    scanPageId: "sp-loan6-employment",
    ruleId: "select-name",
    impact: "critical",
    status: "open",
    priority: "urgent",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<select name="employmentStatus" class="vf-select"></select>',
    target: ["#employment-form .vf-select[name='employmentStatus']"],
    failureSummary:
      "Fix any of the following: Select element does not have an accessible name.",
  }),
  createViolation({
    scanRunId: "sr-loan-6",
    scanPageId: "sp-loan6-review",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2025-01-06T16:45:00.000Z",
    lastSeenAt: "2025-03-03T09:05:00.000Z",
    html: '<span class="review-label">Loan amount</span>',
    target: [".review-summary .review-label"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.1:1 (foreground: #7a7a7a, background: #f8f8f8). Expected contrast ratio of 4.5:1.",
  }),
];

// ─── Customer Dashboard violations ───────────────────────────────────────────
// Story: High-risk. ARIA, table, and keyboard issues across all scans.
// Transaction history and statements pages are the worst offenders.
// Zero remediation activity — all statuses remain open throughout.

const dashboardViolations: ViolationInstance[] = [
  // Transaction history — table issues recurring in every scan
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-txn",
    ruleId: "th-has-data-cells",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<th scope="col" id="col-actions">Actions</th>',
    target: ["#transaction-table thead th#col-actions"],
    failureSummary:
      "Fix any of the following: Header cell does not have a corresponding data cell in the same column.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-txn",
    ruleId: "aria-required-attr",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div role="combobox" class="filter-dropdown">',
    target: ["#transaction-filters .filter-dropdown"],
    failureSummary:
      "Fix any of the following: Required ARIA attribute not present: aria-expanded.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-statements",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="stmt-period stmt-type">January 2024</td>',
    target: ["#statements-table tbody tr:nth-child(1) td:nth-child(1)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'stmt-period' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-statements",
    ruleId: "scope-attr-valid",
    impact: "moderate",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<th scope="row">Statement Type</th>',
    target: ["#statements-table thead th:nth-child(2)"],
    failureSummary:
      "Fix any of the following: The scope attribute 'row' is used on a column header. Expected 'col'.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-overview",
    ruleId: "aria-roles",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div role="progress" class="balance-indicator">',
    target: [".account-summary .balance-indicator"],
    failureSummary:
      "Fix any of the following: Role must be one of the valid ARIA roles: 'progress' is not a valid ARIA role. Did you mean 'progressbar'?",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-overview",
    ruleId: "aria-hidden-focus",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div aria-hidden="true"><button class="tooltip-trigger">?</button></div>',
    target: [".account-card .tooltip-trigger"],
    failureSummary:
      "Fix any of the following: Focusable element is inside an element with aria-hidden. Ensure that all focusable elements are not contained within aria-hidden elements.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-transfer",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<input type="number" name="transferAmount" class="amount-input">',
    target: ["#transfer-form .amount-input"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),
  createViolation({
    scanRunId: "sr-dash-1",
    scanPageId: "sp-dash1-payments",
    ruleId: "aria-required-attr",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<ul role="listbox" class="payee-list">',
    target: ["#bill-pay .payee-list"],
    failureSummary:
      "Fix any of the following: Required ARIA attribute not present: aria-labelledby.",
  }),

  // Scans 2-6 — same issues, zero remediation
  // Replicating the core recurring violations across remaining scans
  createViolation({
    scanRunId: "sr-dash-2",
    scanPageId: "sp-dash2-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-2",
    scanPageId: "sp-dash2-txn",
    ruleId: "aria-required-attr",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div role="combobox" class="filter-dropdown">',
    target: ["#transaction-filters .filter-dropdown"],
    failureSummary:
      "Fix any of the following: Required ARIA attribute not present: aria-expanded.",
  }),
  createViolation({
    scanRunId: "sr-dash-2",
    scanPageId: "sp-dash2-statements",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="stmt-period stmt-type">January 2024</td>',
    target: ["#statements-table tbody tr:nth-child(1) td:nth-child(1)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'stmt-period' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-2",
    scanPageId: "sp-dash2-overview",
    ruleId: "aria-roles",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div role="progress" class="balance-indicator">',
    target: [".account-summary .balance-indicator"],
    failureSummary:
      "Fix any of the following: Role must be one of the valid ARIA roles: 'progress' is not a valid ARIA role.",
  }),
  createViolation({
    scanRunId: "sr-dash-3",
    scanPageId: "sp-dash3-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-3",
    scanPageId: "sp-dash3-statements",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="stmt-period stmt-type">January 2024</td>',
    target: ["#statements-table tbody tr:nth-child(1) td:nth-child(1)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'stmt-period' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-3",
    scanPageId: "sp-dash3-overview",
    ruleId: "aria-hidden-focus",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div aria-hidden="true"><button class="tooltip-trigger">?</button></div>',
    target: [".account-card .tooltip-trigger"],
    failureSummary:
      "Fix any of the following: Focusable element is inside an element with aria-hidden.",
  }),
  createViolation({
    scanRunId: "sr-dash-4",
    scanPageId: "sp-dash4-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-4",
    scanPageId: "sp-dash4-statements",
    ruleId: "scope-attr-valid",
    impact: "moderate",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<th scope="row">Statement Type</th>',
    target: ["#statements-table thead th:nth-child(2)"],
    failureSummary:
      "Fix any of the following: The scope attribute 'row' is used on a column header. Expected 'col'.",
  }),
  createViolation({
    scanRunId: "sr-dash-4",
    scanPageId: "sp-dash4-transfer",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<input type="number" name="transferAmount" class="amount-input">',
    target: ["#transfer-form .amount-input"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>.",
  }),
  createViolation({
    scanRunId: "sr-dash-5",
    scanPageId: "sp-dash5-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-5",
    scanPageId: "sp-dash5-statements",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="stmt-period stmt-type">January 2024</td>',
    target: ["#statements-table tbody tr:nth-child(1) td:nth-child(1)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'stmt-period' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-5",
    scanPageId: "sp-dash5-overview",
    ruleId: "aria-roles",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div role="progress" class="balance-indicator">',
    target: [".account-summary .balance-indicator"],
    failureSummary:
      "Fix any of the following: Role must be one of the valid ARIA roles: 'progress' is not a valid ARIA role.",
  }),
  createViolation({
    scanRunId: "sr-dash-6",
    scanPageId: "sp-dash6-txn",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="col-amount col-date">$1,240.00</td>',
    target: ["#transaction-table tbody tr:nth-child(1) td:nth-child(3)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'col-amount' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-6",
    scanPageId: "sp-dash6-statements",
    ruleId: "td-headers-attr",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<td headers="stmt-period stmt-type">January 2024</td>',
    target: ["#statements-table tbody tr:nth-child(1) td:nth-child(1)"],
    failureSummary:
      "Fix any of the following: The headers attribute references the id 'stmt-period' which does not exist in this table.",
  }),
  createViolation({
    scanRunId: "sr-dash-6",
    scanPageId: "sp-dash6-overview",
    ruleId: "aria-hidden-focus",
    impact: "serious",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<div aria-hidden="true"><button class="tooltip-trigger">?</button></div>',
    target: [".account-card .tooltip-trigger"],
    failureSummary:
      "Fix any of the following: Focusable element is inside an element with aria-hidden.",
  }),
  createViolation({
    scanRunId: "sr-dash-6",
    scanPageId: "sp-dash6-payments",
    ruleId: "aria-required-attr",
    impact: "critical",
    status: "open",
    priority: "high",
    firstSeenAt: "2024-10-01T09:10:00.000Z",
    lastSeenAt: "2025-03-03T09:10:00.000Z",
    html: '<ul role="listbox" class="payee-list">',
    target: ["#bill-pay .payee-list"],
    failureSummary:
      "Fix any of the following: Required ARIA attribute not present: aria-labelledby.",
  }),
];

// ─── Support Center violations ────────────────────────────────────────────────
// Story: Stagnant. Low volume, same issues persisting with no action.
// Mostly heading-order and color-contrast — the quiet kind of neglect.

const supportViolations: ViolationInstance[] = [
  createViolation({
    scanRunId: "sr-sup-1",
    scanPageId: "sp-sup1-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-1",
    scanPageId: "sp-sup1-accounts",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<span class="article-meta">Updated 3 months ago</span>',
    target: [".article-card .article-meta"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.4:1 (foreground: #888888, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-sup-1",
    scanPageId: "sp-sup1-loans",
    ruleId: "image-redundant-alt",
    impact: "minor",
    status: "accepted-risk",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<img src="/icons/info.svg" alt="Information"> Information',
    target: [".help-article .inline-icon"],
    failureSummary:
      "Fix any of the following: Image alternative text is the same as adjacent text. This creates a redundant reading experience for screen reader users.",
    notes: "Accepted risk — icon is decorative. Will revisit in Q2.",
  }),
  createViolation({
    scanRunId: "sr-sup-1",
    scanPageId: "sp-sup1-security",
    ruleId: "tabindex",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<div tabindex="3" class="alert-banner">',
    target: [".security-page .alert-banner"],
    failureSummary:
      "Fix any of the following: Element has a tabindex greater than 0. This disrupts the natural tab order of the page.",
  }),
  createViolation({
    scanRunId: "sr-sup-1",
    scanPageId: "sp-sup1-contact",
    ruleId: "label",
    impact: "critical",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<textarea name="message" placeholder="Describe your issue..."></textarea>',
    target: ["#support-contact-form textarea[name='message']"],
    failureSummary:
      "Fix any of the following: Form element does not have an implicit (wrapped) <label>. Form element does not have an explicit <label>.",
  }),

  // Scans 2-6 — same issues, flat, no resolution
  createViolation({
    scanRunId: "sr-sup-2",
    scanPageId: "sp-sup2-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-2",
    scanPageId: "sp-sup2-accounts",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<span class="article-meta">Updated 3 months ago</span>',
    target: [".article-card .article-meta"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.4:1 (foreground: #888888, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-sup-2",
    scanPageId: "sp-sup2-security",
    ruleId: "tabindex",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<div tabindex="3" class="alert-banner">',
    target: [".security-page .alert-banner"],
    failureSummary:
      "Fix any of the following: Element has a tabindex greater than 0.",
  }),
  createViolation({
    scanRunId: "sr-sup-3",
    scanPageId: "sp-sup3-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-3",
    scanPageId: "sp-sup3-accounts",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<span class="article-meta">Updated 3 months ago</span>',
    target: [".article-card .article-meta"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.4:1 (foreground: #888888, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-sup-4",
    scanPageId: "sp-sup4-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-4",
    scanPageId: "sp-sup4-security",
    ruleId: "tabindex",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<div tabindex="3" class="alert-banner">',
    target: [".security-page .alert-banner"],
    failureSummary:
      "Fix any of the following: Element has a tabindex greater than 0.",
  }),
  createViolation({
    scanRunId: "sr-sup-5",
    scanPageId: "sp-sup5-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-5",
    scanPageId: "sp-sup5-security",
    ruleId: "tabindex",
    impact: "serious",
    status: "open",
    priority: "medium",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<div tabindex="3" class="alert-banner">',
    target: [".security-page .alert-banner"],
    failureSummary:
      "Fix any of the following: Element has a tabindex greater than 0.",
  }),
  createViolation({
    scanRunId: "sr-sup-6",
    scanPageId: "sp-sup6-home",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Popular Articles</h4>",
    target: [".support-home .popular-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
  createViolation({
    scanRunId: "sr-sup-6",
    scanPageId: "sp-sup6-accounts",
    ruleId: "color-contrast",
    impact: "serious",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: '<span class="article-meta">Updated 3 months ago</span>',
    target: [".article-card .article-meta"],
    failureSummary:
      "Fix any of the following: Element has insufficient color contrast of 3.4:1 (foreground: #888888, background: #ffffff). Expected contrast ratio of 4.5:1.",
  }),
  createViolation({
    scanRunId: "sr-sup-6",
    scanPageId: "sp-sup6-loans",
    ruleId: "heading-order",
    impact: "moderate",
    status: "open",
    priority: "low",
    firstSeenAt: "2024-10-01T09:15:00.000Z",
    lastSeenAt: "2025-03-03T09:15:00.000Z",
    html: "<h4>Related Articles</h4>",
    target: [".loan-help .related-articles h4"],
    failureSummary:
      "Fix any of the following: Heading order invalid — h4 follows h2 with no h3 in between.",
  }),
];

// ─── Export ───────────────────────────────────────────────────────────────────

export const violations: ViolationInstance[] = [
  ...marketingViolations,
  ...loanViolations,
  ...dashboardViolations,
  ...supportViolations,
];
