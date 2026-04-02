// src/lib/data/violations.ts
//
// Violation counts are the source of truth. scan-pages.ts must match these exactly.
//
// ViolationSeed fields:
//   scanPageId   — links to ScanPage
//   scanRunId    — links to ScanRun (required for date lookup and ID generation)
//   ruleId       — axe rule identifier
//   count        — number of individual element violations
//   impact       — severity
//   status       — current remediation state
//   group        — optional suffix when the same page/rule appears with different
//                  statuses or assignees (prevents ID collisions)
//   assignedTo   — optional assignee name
//   priority     — optional override; defaults to getPriority(impact)

import type { ViolationInstance } from "@/lib/data/types/domain";

type ViolationSeed = {
  scanPageId: string;
  scanRunId: string;
  ruleId: string;
  count: number;
  impact: ViolationInstance["impact"];
  status: ViolationInstance["status"];
  group?: string;
  assignedTo?: string;
  priority?: ViolationInstance["priority"];
};

const scanDates: Record<string, { firstSeenAt: string; lastSeenAt: string }> = {
  "sr-mkt-baseline": {
    firstSeenAt: "2024-09-15T09:00:00.000Z",
    lastSeenAt: "2024-09-15T09:42:18.000Z",
  },
  "sr-mkt-rescan": {
    firstSeenAt: "2025-02-12T10:00:00.000Z",
    lastSeenAt: "2025-02-12T10:38:54.000Z",
  },
  "sr-loan-baseline": {
    firstSeenAt: "2024-09-18T09:00:00.000Z",
    lastSeenAt: "2024-09-18T09:31:04.000Z",
  },
  "sr-loan-rescan": {
    firstSeenAt: "2025-01-30T09:00:00.000Z",
    lastSeenAt: "2025-01-30T09:48:22.000Z",
  },
  "sr-dash-baseline": {
    firstSeenAt: "2024-09-20T09:00:00.000Z",
    lastSeenAt: "2024-09-20T09:44:16.000Z",
  },
  "sr-dash-rescan": {
    firstSeenAt: "2025-03-05T09:00:00.000Z",
    lastSeenAt: "2025-03-05T09:51:33.000Z",
  },
  "sr-sup-baseline": {
    firstSeenAt: "2024-09-22T09:00:00.000Z",
    lastSeenAt: "2024-09-22T09:36:29.000Z",
  },
  "sr-sup-rescan": {
    firstSeenAt: "2024-11-04T09:00:00.000Z",
    lastSeenAt: "2024-11-04T09:34:11.000Z",
  },
};

type ViolationTemplate = {
  html: string;
  failureSummary: string;
  target: string;
};

const defaultRuleTemplates: Record<string, ViolationTemplate> = {
  "color-contrast": {
    html: '<p class="body-text text-muted">Estimated payoff amount available after approval.</p>',
    failureSummary:
      "Element has insufficient color contrast of 3.4:1 (foreground: #6f6f6f, background: #ffffff, expected 4.5:1).",
    target: "main .text-muted",
  },
  "image-alt": {
    html: '<img src="/assets/promo.jpg" class="promo-image" />',
    failureSummary: "Element does not have an alt attribute.",
    target: "main img.promo-image",
  },
  "image-redundant-alt": {
    html: '<img src="/icons/checkmark.svg" alt="Transfer complete" class="status-icon" />',
    failureSummary:
      'Image alternative text is the same as adjacent text content. Set alt="" to mark as decorative.',
    target: ".status-message img.status-icon",
  },
  label: {
    html: '<input type="text" class="form-input" placeholder="Enter value" />',
    failureSummary:
      "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
    target: "form .form-input",
  },
  "button-name": {
    html: '<button type="button" class="icon-button"><svg aria-hidden="true" focusable="false"></svg></button>',
    failureSummary:
      "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
    target: ".icon-button",
  },
  "link-name": {
    html: '<a href="/learn-more" class="icon-link"><svg aria-hidden="true"></svg></a>',
    failureSummary:
      "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
    target: "a.icon-link",
  },
  "select-name": {
    html: '<select class="form-select" id="loan-type"></select>',
    failureSummary:
      "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
    target: "form select.form-select",
  },
  "autocomplete-valid": {
    html: '<input type="text" autocomplete="name" class="form-input" />',
    failureSummary:
      "autocomplete attribute is incorrectly used. The value 'name' is not appropriate for this input type.",
    target: "form input[autocomplete='name']",
  },
  "heading-order": {
    html: "<h4>Section Subtitle</h4>",
    failureSummary:
      "Heading order invalid. Fix any of the following: heading skips from h2 to h4.",
    target: "main h4",
  },
  bypass: {
    html: "<html>",
    failureSummary:
      "No skip mechanism found. Fix any of the following: no skip link present, no landmark regions (main, nav, header) to support landmark navigation.",
    target: "html",
  },
  "aria-required-attr": {
    html: '<div role="combobox" aria-controls="dropdown-list" class="custom-dropdown">',
    failureSummary:
      "Required ARIA attribute not present: aria-expanded. Fix by adding aria-expanded to describe the expanded/collapsed state.",
    target: "[role='combobox'].custom-dropdown",
  },
  "aria-hidden-focus": {
    html: '<div aria-hidden="true"><button type="button" class="icon-btn">×</button></div>',
    failureSummary:
      'Focusable content is within an aria-hidden element. Fix any of the following: remove aria-hidden, or add tabindex="-1" to all focusable children.',
    target: "[aria-hidden='true'] .icon-btn",
  },
  "td-headers-attr": {
    html: '<td class="amount-cell">$2,340.00</td>',
    failureSummary:
      "Cell does not refer to an existing table header. The headers attribute references an id that does not exist in the table.",
    target: "table td.amount-cell",
  },
  "th-has-data-cells": {
    html: '<th scope="col" class="table-header">Balance</th>',
    failureSummary:
      "Table header does not refer to any data cells. Ensure all th elements have associated td cells in their row or column.",
    target: "table th.table-header",
  },
  "scope-attr-valid": {
    html: '<th scope="row" class="account-label">Checking Account</th>',
    failureSummary:
      'Table header scope attribute is incorrect. Change scope="row" to scope="col" for this column header.',
    target: "table th.account-label",
  },
};

const pickVariant = <T>(variants: T[], index: number): T =>
  variants[index % variants.length];

const buildTarget = (root: string, selector: string): string =>
  `${root} ${selector}`.replace(/\s+/g, " ").trim();

const getPageRoot = (scanPageId: string): string => {
  const pageRoots: Array<[string, string]> = [
    ["sp-mkt-b-home", "main .home-page"],
    ["sp-mkt-r-home", "main .home-page"],
    ["sp-mkt-b-personal", "main .personal-banking-page"],
    ["sp-mkt-r-personal", "main .personal-banking-page"],
    ["sp-mkt-b-business", "main .business-banking-page"],
    ["sp-mkt-r-business", "main .business-banking-page"],
    ["sp-mkt-b-loans", "main .loans-credit-page"],
    ["sp-mkt-r-loans", "main .loans-credit-page"],
    ["sp-mkt-b-rates", "main .rates-fees-page"],
    ["sp-mkt-r-rates", "main .rates-fees-page"],
    ["sp-mkt-b-about", "main .about-page"],
    ["sp-mkt-r-about", "main .about-page"],
    ["sp-mkt-b-contact", "main .contact-page"],
    ["sp-mkt-r-contact", "main .contact-page"],
    ["sp-mkt-b-careers", "main .careers-page"],
    ["sp-mkt-r-careers", "main .careers-page"],
    ["sp-loan-b-start", "main form#loan-start-step"],
    ["sp-loan-r-start", "main form#loan-start-step"],
    ["sp-loan-b-personal", "main form#loan-personal-step"],
    ["sp-loan-r-personal", "main form#loan-personal-step"],
    ["sp-loan-b-employment", "main form#loan-employment-step"],
    ["sp-loan-r-employment", "main form#loan-employment-step"],
    ["sp-loan-r-assets", "main form#loan-assets-step"],
    ["sp-loan-r-housing", "main form#loan-housing-step"],
    ["sp-loan-b-review", "main section#application-review"],
    ["sp-loan-r-review", "main section#application-review"],
    ["sp-loan-r-documents", "main section#document-upload"],
    ["sp-loan-b-confirm", "main section#application-confirmation"],
    ["sp-loan-r-confirm", "main section#application-confirmation"],
    ["sp-dash-b-overview", "main .dashboard-overview"],
    ["sp-dash-r-overview", "main .dashboard-overview"],
    ["sp-dash-b-accounts", "main .accounts-table-panel"],
    ["sp-dash-r-accounts", "main .accounts-table-panel"],
    ["sp-dash-b-txn", "main .transaction-history-panel"],
    ["sp-dash-r-txn", "main .transaction-history-panel"],
    ["sp-dash-b-transfer", "main .transfer-funds-panel"],
    ["sp-dash-r-transfer", "main .transfer-funds-panel"],
    ["sp-dash-b-payments", "main .bill-pay-panel"],
    ["sp-dash-r-payments", "main .bill-pay-panel"],
    ["sp-dash-b-profile", "main .profile-settings-page"],
    ["sp-dash-r-profile", "main .profile-settings-page"],
    ["sp-dash-b-statements", "main .statements-documents-panel"],
    ["sp-dash-r-statements", "main .statements-documents-panel"],
    ["sp-sup-b-home", "main .support-home-page"],
    ["sp-sup-r-home", "main .support-home-page"],
    ["sp-sup-b-accounts", "main .account-help-page"],
    ["sp-sup-r-accounts", "main .account-help-page"],
    ["sp-sup-b-loans", "main .loan-help-page"],
    ["sp-sup-r-loans", "main .loan-help-page"],
    ["sp-sup-b-security", "main .security-fraud-page"],
    ["sp-sup-r-security", "main .security-fraud-page"],
    ["sp-sup-b-contact", "main .contact-support-page"],
    ["sp-sup-r-contact", "main .contact-support-page"],
  ];

  return pageRoots.find(([key]) => scanPageId === key)?.[1] ?? "main";
};

const getContextTag = (scanPageId: string): string => {
  if (scanPageId.includes("-mkt-")) return "marketing";
  if (scanPageId.includes("-loan-")) return "loan";
  if (scanPageId.includes("-dash-")) return "dashboard";
  if (scanPageId.includes("-sup-")) return "support";
  return "generic";
};

const buildRuleTemplate = (
  seed: ViolationSeed,
  index: number,
): ViolationTemplate => {
  const root = getPageRoot(seed.scanPageId);
  const context = getContextTag(seed.scanPageId);

  switch (seed.ruleId) {
    case "color-contrast": {
      const variantsByContext: Record<
        string,
        Array<{
          html: string;
          failureSummary: string;
          selector: string;
        }>
      > = {
        marketing: [
          {
            html: '<p class="hero-eyebrow text-muted">Limited-time rate offer for new accounts.</p>',
            failureSummary:
              "Element has insufficient color contrast of 3.2:1 (foreground: #7a7a7a, background: #ffffff, expected 4.5:1).",
            selector: ".hero-section .hero-eyebrow.text-muted",
          },
          {
            html: '<a href="/rates" class="rate-disclaimer text-subtle">View current rates and disclosures</a>',
            failureSummary:
              "Element has insufficient color contrast of 3.4:1 (foreground: #707070, background: #ffffff, expected 4.5:1).",
            selector: ".rate-card .rate-disclaimer.text-subtle",
          },
          {
            html: '<span class="card-kicker text-secondary">Member FDIC</span>',
            failureSummary:
              "Element has insufficient color contrast of 3.1:1 (foreground: #787878, background: #ffffff, expected 4.5:1).",
            selector: ".promo-card .card-kicker.text-secondary",
          },
          {
            html: '<p class="form-helper text-muted">We usually respond within one business day.</p>',
            failureSummary:
              "Element has insufficient color contrast of 3.3:1 (foreground: #747474, background: #ffffff, expected 4.5:1).",
            selector: ".contact-form .form-helper.text-muted",
          },
          {
            html: '<span class="job-meta text-muted">Remote eligible in select states</span>',
            failureSummary:
              "Element has insufficient color contrast of 3.5:1 (foreground: #6d6d6d, background: #ffffff, expected 4.5:1).",
            selector: ".job-listing .job-meta.text-muted",
          },
          {
            html: '<td class="fee-note text-muted">Waived with qualifying balance</td>',
            failureSummary:
              "Element has insufficient color contrast of 3.0:1 (foreground: #7d7d7d, background: #ffffff, expected 4.5:1).",
            selector: ".fees-table td.fee-note.text-muted",
          },
        ],
      };

      const loanVariants = [
        {
          html: '<p class="field-help text-muted">Use your legal name as it appears on your ID.</p>',
          failureSummary:
            "Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff, expected 4.5:1).",
          selector: ".field-group .field-help.text-muted",
        },
        {
          html: '<span class="step-caption text-secondary">Step details update automatically as you progress</span>',
          failureSummary:
            "Element has insufficient color contrast of 3.4:1 (foreground: #6f6f6f, background: #ffffff, expected 4.5:1).",
          selector: ".step-header .step-caption.text-secondary",
        },
        {
          html: '<p class="upload-note text-muted">PDF or JPG, 10MB maximum per file.</p>',
          failureSummary:
            "Element has insufficient color contrast of 3.1:1 (foreground: #797979, background: #ffffff, expected 4.5:1).",
          selector: ".upload-dropzone .upload-note.text-muted",
        },
        {
          html: '<span class="review-label text-muted">Estimated monthly payment</span>',
          failureSummary:
            "Element has insufficient color contrast of 3.3:1 (foreground: #737373, background: #ffffff, expected 4.5:1).",
          selector: ".review-summary .review-label.text-muted",
        },
      ];

      const dashboardVariants = [
        {
          html: '<span class="account-meta text-muted">Available balance updated today</span>',
          failureSummary:
            "Element has insufficient color contrast of 3.4:1 (foreground: #707070, background: #ffffff, expected 4.5:1).",
          selector: ".account-card .account-meta.text-muted",
        },
        {
          html: '<button type="button" class="filter-chip text-secondary">Custom date range</button>',
          failureSummary:
            "Element has insufficient color contrast of 3.2:1 (foreground: #777777, background: #ffffff, expected 4.5:1).",
          selector: ".toolbar .filter-chip.text-secondary",
        },
        {
          html: '<td class="transaction-note text-muted">Pending merchant settlement</td>',
          failureSummary:
            "Element has insufficient color contrast of 3.1:1 (foreground: #7b7b7b, background: #ffffff, expected 4.5:1).",
          selector: "table .transaction-note.text-muted",
        },
        {
          html: '<p class="settings-description text-muted">Choose how you want to receive alerts.</p>',
          failureSummary:
            "Element has insufficient color contrast of 3.3:1 (foreground: #747474, background: #ffffff, expected 4.5:1).",
          selector: ".settings-section .settings-description.text-muted",
        },
      ];

      const supportVariants = [
        {
          html: '<p class="article-meta text-muted">Updated 3 months ago</p>',
          failureSummary:
            "Element has insufficient color contrast of 3.2:1 (foreground: #767676, background: #ffffff, expected 4.5:1).",
          selector: ".article-header .article-meta.text-muted",
        },
        {
          html: '<a href="/support/contact" class="support-link text-secondary">Talk to a specialist</a>',
          failureSummary:
            "Element has insufficient color contrast of 3.5:1 (foreground: #6e6e6e, background: #ffffff, expected 4.5:1).",
          selector: ".help-card .support-link.text-secondary",
        },
        {
          html: '<span class="faq-category text-muted">Fraud prevention</span>',
          failureSummary:
            "Element has insufficient color contrast of 3.1:1 (foreground: #7a7a7a, background: #ffffff, expected 4.5:1).",
          selector: ".faq-item .faq-category.text-muted",
        },
        {
          html: '<p class="contact-helper text-muted">Phone support is available Monday through Friday.</p>',
          failureSummary:
            "Element has insufficient color contrast of 3.3:1 (foreground: #747474, background: #ffffff, expected 4.5:1).",
          selector: ".contact-panel .contact-helper.text-muted",
        },
      ];

      const variant = pickVariant(
        context === "marketing"
          ? variantsByContext.marketing
          : context === "loan"
            ? loanVariants
            : context === "dashboard"
              ? dashboardVariants
              : context === "support"
                ? supportVariants
                : [
                    {
                      html: defaultRuleTemplates["color-contrast"].html,
                      failureSummary:
                        defaultRuleTemplates["color-contrast"].failureSummary,
                      selector: defaultRuleTemplates["color-contrast"].target,
                    },
                  ],
        index,
      );

      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "image-alt": {
      const variants = [
        {
          html: '<img src="/assets/hero/family-checking.jpg" class="hero-image" />',
          failureSummary: "Element does not have an alt attribute.",
          selector: ".hero-section img.hero-image",
        },
        {
          html: '<img src="/assets/cards/business-line-of-credit.jpg" class="product-card-image" />',
          failureSummary: "Element does not have an alt attribute.",
          selector: ".product-card img.product-card-image",
        },
        {
          html: '<img src="/assets/team/branch-manager.jpg" class="team-photo" />',
          failureSummary: "Element does not have an alt attribute.",
          selector: ".leadership-grid img.team-photo",
        },
        {
          html: '<img src="/assets/promos/credit-score-monitoring.png" class="promo-banner-image" />',
          failureSummary: "Element does not have an alt attribute.",
          selector: ".promo-banner img.promo-banner-image",
        },
        {
          html: '<img src="/assets/careers/customer-support.jpg" class="culture-image" />',
          failureSummary: "Element does not have an alt attribute.",
          selector: ".culture-gallery img.culture-image",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "image-redundant-alt": {
      const variants = [
        {
          html: '<img src="/icons/checkmark.svg" alt="Open an account" class="feature-icon" />',
          failureSummary:
            'Image alternative text is the same as adjacent text content. Set alt="" to mark as decorative.',
          selector: ".feature-list img.feature-icon",
        },
        {
          html: '<img src="/icons/phone.svg" alt="Contact support" class="contact-icon" />',
          failureSummary:
            'Image alternative text is the same as adjacent text content. Set alt="" to mark as decorative.',
          selector: ".contact-method img.contact-icon",
        },
        {
          html: '<img src="/icons/briefcase.svg" alt="Benefits" class="benefit-icon" />',
          failureSummary:
            'Image alternative text is the same as adjacent text content. Set alt="" to mark as decorative.',
          selector: ".benefits-list img.benefit-icon",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "label": {
      const variants = [
        {
          html: '<input type="text" id="applicant-middle-name" class="form-input" placeholder="Middle name" />',
          failureSummary:
            "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
          selector: ".field-group input#applicant-middle-name",
        },
        {
          html: '<input type="text" id="employer-phone" class="form-input" placeholder="Employer phone" />',
          failureSummary:
            "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
          selector: ".employment-section input#employer-phone",
        },
        {
          html: '<textarea id="payment-memo" class="form-textarea" placeholder="Add a memo"></textarea>',
          failureSummary:
            "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
          selector: ".payment-form textarea#payment-memo",
        },
        {
          html: '<input type="password" id="current-password" class="form-input" autocomplete="current-password" />',
          failureSummary:
            "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
          selector: ".security-form input#current-password",
        },
        {
          html: '<input type="text" id="mailing-address-line-2" class="form-input" placeholder="Apt, suite, unit" />',
          failureSummary:
            "Form element does not have an associated label. Fix any of the following: no id, no aria-label, no aria-labelledby.",
          selector: ".address-fields input#mailing-address-line-2",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "button-name": {
      const variants = [
        {
          html: '<button type="button" class="icon-button close-panel"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: "button.icon-button.close-panel",
        },
        {
          html: '<button type="button" class="pagination-button next-page"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: "button.pagination-button.next-page",
        },
        {
          html: '<button type="button" class="toolbar-button filter-toggle"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: ".toolbar button.filter-toggle",
        },
        {
          html: '<button type="button" class="stepper-control remove-file"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: ".uploaded-file button.remove-file",
        },
        {
          html: '<button type="button" class="action-menu-trigger"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: ".row-actions button.action-menu-trigger",
        },
        {
          html: '<button type="button" class="accordion-toggle"><svg aria-hidden="true" focusable="false"></svg></button>',
          failureSummary:
            "Button does not have an accessible name. Fix any of the following: element has no aria-label, no aria-labelledby, and no text content.",
          selector: ".faq-item button.accordion-toggle",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "link-name": {
      const variants = [
        {
          html: '<a href="/accounts/checking" class="icon-link"><svg aria-hidden="true"></svg></a>',
          failureSummary:
            "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
          selector: "a.icon-link",
        },
        {
          html: '<a href="/support/article/overdraft-fees" class="card-link-overlay"></a>',
          failureSummary:
            "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
          selector: ".help-card a.card-link-overlay",
        },
        {
          html: '<a href="/loan-application/restart" class="restart-link"><span class="sr-only-hidden"></span></a>',
          failureSummary:
            "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
          selector: ".application-header a.restart-link",
        },
        {
          html: '<a href="/about/social/linkedin" class="social-link"><svg aria-hidden="true"></svg></a>',
          failureSummary:
            "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
          selector: ".social-links a.social-link",
        },
        {
          html: '<a href="/statements/download/march" class="download-link"><svg aria-hidden="true"></svg></a>',
          failureSummary:
            "Link does not have a discernible name. Fix any of the following: element has no text content, no aria-label, no aria-labelledby.",
          selector: ".document-row a.download-link",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "select-name": {
      const variants = [
        {
          html: '<select id="loan-purpose" class="form-select"><option>Purchase</option></select>',
          failureSummary:
            "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
          selector: ".loan-details select#loan-purpose",
        },
        {
          html: '<select id="employment-status" class="form-select"><option>Full time</option></select>',
          failureSummary:
            "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
          selector: ".employment-section select#employment-status",
        },
        {
          html: '<select id="housing-status" class="form-select"><option>Own</option></select>',
          failureSummary:
            "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
          selector: ".housing-section select#housing-status",
        },
        {
          html: '<select id="asset-type" class="form-select"><option>Checking</option></select>',
          failureSummary:
            "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
          selector: ".asset-row select#asset-type",
        },
        {
          html: '<select id="state-of-residence" class="form-select"><option>Arizona</option></select>',
          failureSummary:
            "Select element does not have an accessible name. Fix any of the following: element has no associated label, no aria-label, no aria-labelledby.",
          selector: ".address-fields select#state-of-residence",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "autocomplete-valid": {
      const variants = [
        {
          html: '<input type="text" id="loan-id" autocomplete="name" class="form-input" />',
          failureSummary:
            "autocomplete attribute is incorrectly used. The value 'name' is not appropriate for this input type.",
          selector: "input#loan-id[autocomplete='name']",
        },
        {
          html: '<input type="text" id="annual-income" autocomplete="street-address" class="form-input currency-input" />',
          failureSummary:
            "autocomplete attribute is incorrectly used. The value 'street-address' is not appropriate for this input type.",
          selector: "input#annual-income[autocomplete='street-address']",
        },
        {
          html: '<input type="text" id="employer-name" autocomplete="postal-code" class="form-input" />',
          failureSummary:
            "autocomplete attribute is incorrectly used. The value 'postal-code' is not appropriate for this input type.",
          selector: "input#employer-name[autocomplete='postal-code']",
        },
        {
          html: '<input type="text" id="monthly-rent" autocomplete="email" class="form-input currency-input" />',
          failureSummary:
            "autocomplete attribute is incorrectly used. The value 'email' is not appropriate for this input type.",
          selector: "input#monthly-rent[autocomplete='email']",
        },
        {
          html: '<input type="text" id="contact-preference" autocomplete="family-name" class="form-input" />',
          failureSummary:
            "autocomplete attribute is incorrectly used. The value 'family-name' is not appropriate for this input type.",
          selector: "input#contact-preference[autocomplete='family-name']",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "heading-order": {
      const variants = [
        {
          html: "<h4>Rates for everyday banking</h4>",
          failureSummary:
            "Heading order invalid. Fix any of the following: heading skips from h2 to h4.",
          selector: "section h4",
        },
        {
          html: "<h5>Upload requirements</h5>",
          failureSummary:
            "Heading order invalid. Fix any of the following: heading skips from h3 to h5.",
          selector: ".content-section h5",
        },
        {
          html: "<h4>Profile preferences</h4>",
          failureSummary:
            "Heading order invalid. Fix any of the following: heading skips from h2 to h4.",
          selector: ".settings-group h4",
        },
        {
          html: "<h6>Need more help?</h6>",
          failureSummary:
            "Heading order invalid. Fix any of the following: heading skips from h4 to h6.",
          selector: ".support-footer h6",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "bypass": {
      const variants = [
        {
          html: "<html>",
          failureSummary:
            "No skip mechanism found. Fix any of the following: no skip link present, no landmark regions (main, nav, header) to support landmark navigation.",
          selector: "html",
        },
        {
          html: '<body class="support-shell">',
          failureSummary:
            "No skip mechanism found. Fix any of the following: no skip link present, and repeated navigation appears before the main content on every page load.",
          selector: "body.support-shell",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: variant.selector,
      };
    }

    case "aria-required-attr": {
      const variants = [
        {
          html: '<div role="combobox" aria-controls="from-account-list" class="transfer-combobox"></div>',
          failureSummary:
            "Required ARIA attribute not present: aria-expanded. Fix by adding aria-expanded to describe the expanded/collapsed state.",
          selector: "[role='combobox'].transfer-combobox",
        },
        {
          html: '<div role="combobox" aria-controls="payee-list" class="payee-combobox"></div>',
          failureSummary:
            "Required ARIA attribute not present: aria-expanded. Fix by adding aria-expanded to describe the expanded/collapsed state.",
          selector: "[role='combobox'].payee-combobox",
        },
        {
          html: '<div role="combobox" aria-controls="statement-filter-list" class="statement-filter-combobox"></div>',
          failureSummary:
            "Required ARIA attribute not present: aria-expanded. Fix by adding aria-expanded to describe the expanded/collapsed state.",
          selector: "[role='combobox'].statement-filter-combobox",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "aria-hidden-focus": {
      const variants = [
        {
          html: '<div aria-hidden="true" class="loading-shim"><button type="button" class="retry-button">Retry</button></div>',
          failureSummary:
            'Focusable content is within an aria-hidden element. Fix any of the following: remove aria-hidden, or add tabindex="-1" to all focusable children.',
          selector: "[aria-hidden='true'].loading-shim .retry-button",
        },
        {
          html: '<div aria-hidden="true" class="modal-backdrop-copy"><a href="/accounts" class="back-link">Back to accounts</a></div>',
          failureSummary:
            'Focusable content is within an aria-hidden element. Fix any of the following: remove aria-hidden, or add tabindex="-1" to all focusable children.',
          selector: "[aria-hidden='true'].modal-backdrop-copy .back-link",
        },
        {
          html: '<div aria-hidden="true" class="collapsed-panel"><button type="button" class="edit-link-button">Edit</button></div>',
          failureSummary:
            'Focusable content is within an aria-hidden element. Fix any of the following: remove aria-hidden, or add tabindex="-1" to all focusable children.',
          selector: "[aria-hidden='true'].collapsed-panel .edit-link-button",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "td-headers-attr": {
      const variants = [
        {
          html: '<td headers="col-balance col-available" class="amount-cell">$2,340.00</td>',
          failureSummary:
            "Cell does not refer to an existing table header. The headers attribute references an id that does not exist in the table.",
          selector: "table tbody tr td.amount-cell",
        },
        {
          html: '<td headers="date-header merchant-header amount-header missing-category-header" class="transaction-cell">Groceries</td>',
          failureSummary:
            "Cell does not refer to an existing table header. The headers attribute references an id that does not exist in the table.",
          selector: "table tbody tr td.transaction-cell",
        },
        {
          html: '<td headers="statement-month statement-type missing-actions" class="document-cell">March 2025</td>',
          failureSummary:
            "Cell does not refer to an existing table header. The headers attribute references an id that does not exist in the table.",
          selector: "table tbody tr td.document-cell",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "th-has-data-cells": {
      const variants = [
        {
          html: '<th scope="col" class="table-header">Nickname</th>',
          failureSummary:
            "Table header does not refer to any data cells. Ensure all th elements have associated td cells in their row or column.",
          selector: "table thead th.table-header",
        },
        {
          html: '<th scope="col" class="table-header">Export Status</th>',
          failureSummary:
            "Table header does not refer to any data cells. Ensure all th elements have associated td cells in their row or column.",
          selector: "table thead th.table-header",
        },
        {
          html: '<th scope="col" class="table-header">Running Balance</th>',
          failureSummary:
            "Table header does not refer to any data cells. Ensure all th elements have associated td cells in their row or column.",
          selector: "table thead th.table-header",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    case "scope-attr-valid": {
      const variants = [
        {
          html: '<th scope="row" class="account-label">Available Balance</th>',
          failureSummary:
            'Table header scope attribute is incorrect. Change scope="row" to scope="col" for this column header.',
          selector: "table thead th.account-label",
        },
        {
          html: '<th scope="row" class="transaction-header">Posted Date</th>',
          failureSummary:
            'Table header scope attribute is incorrect. Change scope="row" to scope="col" for this column header.',
          selector: "table thead th.transaction-header",
        },
        {
          html: '<th scope="row" class="statement-header">Document Type</th>',
          failureSummary:
            'Table header scope attribute is incorrect. Change scope="row" to scope="col" for this column header.',
          selector: "table thead th.statement-header",
        },
      ];

      const variant = pickVariant(variants, index);
      return {
        html: variant.html,
        failureSummary: variant.failureSummary,
        target: buildTarget(root, variant.selector),
      };
    }

    default:
      return (
        defaultRuleTemplates[seed.ruleId] ?? {
          html: `<element class="${seed.ruleId}-element">`,
          failureSummary: `${seed.ruleId} violation.`,
          target: buildTarget(root, `.${seed.ruleId}-target`),
        }
      );
  }
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
  const groupKey = seed.group ?? "1";

  return Array.from({ length: seed.count }, (_, i) => {
    const tpl = buildRuleTemplate(seed, i);

    return {
      id: `v-${seed.scanPageId}-${seed.ruleId}-${groupKey}-${i + 1}`,
      scanRunId: seed.scanRunId,
      scanPageId: seed.scanPageId,
      ruleId: seed.ruleId,
      impact: seed.impact,
      status: seed.status,
      priority: seed.priority ?? getPriority(seed.impact),
      firstSeenAt: dates.firstSeenAt,
      lastSeenAt: dates.lastSeenAt,
      html: tpl.html,
      target: [tpl.target],
      failureSummary: tpl.failureSummary,
      ...(seed.assignedTo ? { assignedTo: seed.assignedTo } : {}),
    };
  });
};
// ─────────────────────────────────────────────────────────────────────────────
// VIOLATION REGISTRY
//
// Counts here must agree with scan-pages.ts exactly.
// When the same rule/page pair appears with different statuses or assignees,
// use the `group` field to prevent ID collisions.
// ─────────────────────────────────────────────────────────────────────────────

const violationRegistry: ViolationSeed[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // MARKETING SITE — PREVIOUS AUDIT (Sep 15, 2024)
  // All 132 violations are now verified — confirmed clean by the Feb 2025
  // rescan. The team addressed every issue found in the original audit.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Home (18) ─────────────────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 4,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-redundant-alt",
    count: 1,
    impact: "minor",
    status: "verified",
  },

  // ── Personal Banking (20) ─────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 5,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-redundant-alt",
    count: 2,
    impact: "minor",
    status: "verified",
  },

  // ── Business Banking (18) ─────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-business",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 4,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-business",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-business",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-business",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-business",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "verified",
  },

  // ── Loans & Credit (17) ───────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-loans",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 4,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-loans",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-loans",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-loans",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-loans",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-redundant-alt",
    count: 2,
    impact: "minor",
    status: "verified",
  },

  // ── Rates & Fees (14) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-redundant-alt",
    count: 2,
    impact: "minor",
    status: "verified",
  },

  // ── About Us (16) ─────────────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 4,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },

  // ── Contact (14) ──────────────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-redundant-alt",
    count: 1,
    impact: "minor",
    status: "verified",
  },

  // ── Careers (15) ──────────────────────────────────────────────────────────
  {
    scanPageId: "sp-mkt-b-careers",
    scanRunId: "sr-mkt-baseline",
    ruleId: "image-alt",
    count: 4,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-careers",
    scanRunId: "sr-mkt-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-careers",
    scanRunId: "sr-mkt-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-careers",
    scanRunId: "sr-mkt-baseline",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-b-careers",
    scanRunId: "sr-mkt-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "verified",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MARKETING SITE — CURRENT AUDIT (Feb 12, 2025)
  // Nearly clean. Residual color-contrast across most pages.
  // Two critical issues remain in progress (image-alt on Home, button-name on About).
  // Contact page fully resolved. Total: 27 violations, 21 remaining, 2 critical.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Home (4 = 2 remaining + 2 verified) ──────────────────────────────────
  {
    scanPageId: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    ruleId: "image-alt",
    count: 1,
    impact: "critical",
    status: "in-progress",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },

  // ── Personal Banking (4 = 1 remaining + 3 verified) ──────────────────────
  {
    scanPageId: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "verified",
  },

  // ── Business Banking (4 verified) ──────────────────────
  {
    scanPageId: "sp-mkt-r-business",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-business",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-business",
    scanRunId: "sr-mkt-rescan",
    ruleId: "link-name",
    count: 1,
    impact: "serious",
    status: "verified",
  },

  // ── Loans & Credit 3verified) ─────────────────────────
  {
    scanPageId: "sp-mkt-r-loans",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-loans",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-loans",
    scanRunId: "sr-mkt-rescan",
    ruleId: "link-name",
    count: 1,
    impact: "serious",
    status: "verified",
  },

  // ── Rates & Fees (2  verified) ───────────────────────────
  {
    scanPageId: "sp-mkt-r-rates",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-rates",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },

  // ── About Us (4 = 1 remaining + 1 fixed + 2 verified) ────────────────────
  {
    scanPageId: "sp-mkt-r-about",
    scanRunId: "sr-mkt-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "fixed",
  },
  {
    scanPageId: "sp-mkt-r-about",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-about",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-about",
    scanRunId: "sr-mkt-rescan",
    ruleId: "link-name",
    count: 1,
    impact: "serious",
    status: "verified",
  },

  // ── Contact (3 = 0 remaining + 3 verified — fully resolved) ──────────────
  {
    scanPageId: "sp-mkt-r-contact",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-contact",
    scanRunId: "sr-mkt-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "verified",
  },

  // ── Careers (3 = 0 remaining + 1 fixed + 2 verified) ─────────────────────
  {
    scanPageId: "sp-mkt-r-careers",
    scanRunId: "sr-mkt-rescan",
    ruleId: "color-contrast",
    count: 2,
    impact: "serious",
    status: "verified",
  },
  {
    scanPageId: "sp-mkt-r-careers",
    scanRunId: "sr-mkt-rescan",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LOAN APPLICATION — PREVIOUS AUDIT (Sep 18, 2024)
  // Pre-regression state. 58 violations across 5 pages.
  // Manageable color-contrast, button-name, and link-name issues.
  // Some heading-order and label violations already fixed.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Start Application (12) ────────────────────────────────────────────────
  {
    scanPageId: "sp-loan-b-start",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-start",
    scanRunId: "sr-loan-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-start",
    scanRunId: "sr-loan-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-start",
    scanRunId: "sr-loan-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "fixed",
  },

  // ── Personal Information (13) ─────────────────────────────────────────────
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "label",
    count: 2,
    impact: "critical",
    status: "fixed",
  },
  {
    scanPageId: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ── Employment & Income (11) ──────────────────────────────────────────────
  {
    scanPageId: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ── Review Application (12) ───────────────────────────────────────────────
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "autocomplete-valid",
    count: 1,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
  },

  // ── Confirmation (10) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-loan-b-confirm",
    scanRunId: "sr-loan-baseline",
    ruleId: "color-contrast",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-confirm",
    scanRunId: "sr-loan-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-confirm",
    scanRunId: "sr-loan-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-b-confirm",
    scanRunId: "sr-loan-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "fixed",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LOAN APPLICATION — CURRENT AUDIT (Jan 30, 2025) — REGRESSION
  //
  // A Nov 2024 deploy introduced a new shared form component built without
  // accessibility support. Label associations, autocomplete attributes, and
  // select-name are broken across all 8 steps of the application flow.
  // 207 violations, all open, nothing fixed. Priority: urgent.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Start Application (22) ────────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 4,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 5,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 2,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-start",
    scanRunId: "sr-loan-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },

  // ── Personal Information (32) ─────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 7,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 7,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 5,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 7,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "open",
  },

  // ── Employment & Income (32) ──────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 7,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 7,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 5,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 7,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "open",
  },

  // ── Assets & Liabilities (27) ─────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-assets",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-assets",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 6,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-assets",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 4,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-assets",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-assets",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },

  // ── Housing Information (27) ──────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-housing",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-housing",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 6,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-housing",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 4,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-housing",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-housing",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },

  // ── Review Application (28) ───────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 6,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "select-name",
    count: 4,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "open",
  },

  // ── Document Upload (23) ──────────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-documents",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 5,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-documents",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 6,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-documents",
    scanRunId: "sr-loan-rescan",
    ruleId: "autocomplete-valid",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-documents",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 6,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-documents",
    scanRunId: "sr-loan-rescan",
    ruleId: "aria-required-attr",
    count: 2,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },

  // ── Confirmation (16) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-loan-r-confirm",
    scanRunId: "sr-loan-rescan",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-confirm",
    scanRunId: "sr-loan-rescan",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
    priority: "urgent",
  },
  {
    scanPageId: "sp-loan-r-confirm",
    scanRunId: "sr-loan-rescan",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-loan-r-confirm",
    scanRunId: "sr-loan-rescan",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOMER DASHBOARD — PREVIOUS AUDIT (Sep 20, 2024)
  // 145 violations across 7 pages. High debt load.
  // Table issues dominate Accounts, Transactions, and Statements.
  // ARIA and label failures throughout interactive pages.
  // Team is aware — some violations in-progress — but nothing fixed yet.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Account Overview (18) ─────────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-required-attr",
    count: 3,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "heading-order",
    count: 4,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-hidden-focus",
    count: 2,
    impact: "serious",
    status: "open",
  },

  // ── Accounts (22) ─────────────────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "th-has-data-cells",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "scope-attr-valid",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-hidden-focus",
    count: 2,
    impact: "serious",
    status: "in-progress",
  },

  // ── Transaction History (25) ──────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 6,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "th-has-data-cells",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 5,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "scope-attr-valid",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },

  // ── Transfer Funds (20) ───────────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-transfer",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-transfer",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-transfer",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-required-attr",
    count: 4,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-transfer",
    scanRunId: "sr-dash-baseline",
    ruleId: "label",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-transfer",
    scanRunId: "sr-dash-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Bill Pay (22) ─────────────────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-required-attr",
    count: 3,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "label",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-payments",
    scanRunId: "sr-dash-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },

  // ── Profile & Settings (18) ───────────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-profile",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-profile",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-profile",
    scanRunId: "sr-dash-baseline",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-b-profile",
    scanRunId: "sr-dash-baseline",
    ruleId: "aria-hidden-focus",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-profile",
    scanRunId: "sr-dash-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Statements & Documents (20) ───────────────────────────────────────────
  {
    scanPageId: "sp-dash-b-statements",
    scanRunId: "sr-dash-baseline",
    ruleId: "td-headers-attr",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-statements",
    scanRunId: "sr-dash-baseline",
    ruleId: "th-has-data-cells",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-statements",
    scanRunId: "sr-dash-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-statements",
    scanRunId: "sr-dash-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-b-statements",
    scanRunId: "sr-dash-baseline",
    ruleId: "scope-attr-valid",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOMER DASHBOARD — CURRENT AUDIT (Mar 5, 2025)
  // 124 violations. Active work is visible — fixed and in-progress present —
  // but overall progress is limited. Critical issues persist throughout.
  // Several violations assigned to Alex Rivera.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Account Overview (16 = 14 remaining + 2 fixed) ────────────────────────
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-required-attr",
    count: 2,
    impact: "critical",
    status: "fixed",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-hidden-focus",
    count: 3,
    impact: "serious",
    status: "in-progress",
    assignedTo: "Alex Rivera",
  },

  // ── Accounts (20 = 18 remaining + 2 fixed) ────────────────────────────────
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "th-has-data-cells",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "scope-attr-valid",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-hidden-focus",
    count: 2,
    impact: "serious",
    status: "fixed",
  },

  // ── Transaction History (20 = 18 remaining + 2 fixed) ─────────────────────
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "th-has-data-cells",
    count: 3,
    impact: "serious",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "in-progress",
    group: "ip",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "scope-attr-valid",
    count: 2,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "fixed",
  },

  // ── Transfer Funds (17 = 14 remaining + 3 fixed) ──────────────────────────
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-required-attr",
    count: 2,
    impact: "critical",
    status: "in-progress",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-required-attr",
    count: 2,
    impact: "critical",
    status: "fixed",
    group: "fx",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "open",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-transfer",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 1,
    impact: "moderate",
    status: "fixed",
    group: "fx",
  },

  // ── Bill Pay (19 = 16 remaining + 3 fixed) ────────────────────────────────
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-required-attr",
    count: 2,
    impact: "critical",
    status: "in-progress",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-required-attr",
    count: 1,
    impact: "critical",
    status: "fixed",
    group: "fx",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "label",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-payments",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "fixed",
  },

  // ── Profile & Settings (16 = 14 remaining + 2 fixed) ─────────────────────
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "in-progress",
    group: "ip",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "label",
    count: 3,
    impact: "critical",
    status: "open",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "label",
    count: 1,
    impact: "critical",
    status: "in-progress",
    group: "ip",
    assignedTo: "Alex Rivera",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "aria-hidden-focus",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-profile",
    scanRunId: "sr-dash-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "fixed",
  },

  // ── Statements & Documents (16 = 15 remaining + 1 fixed) ─────────────────
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "td-headers-attr",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "th-has-data-cells",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "button-name",
    count: 1,
    impact: "critical",
    status: "fixed",
    group: "fx",
  },
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "color-contrast",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-dash-r-statements",
    scanRunId: "sr-dash-rescan",
    ruleId: "scope-attr-valid",
    count: 2,
    impact: "moderate",
    status: "open",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SUPPORT CENTER — PREVIOUS AUDIT (Sep 22, 2024)
  // 75 violations across 5 pages. Consistent pattern of button-name, link-name,
  // color-contrast, and bypass failures. No remediation work has started.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Support Home (18) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "link-name",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Account Help (16) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Loan Help (15) ────────────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-b-loans",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-loans",
    scanRunId: "sr-sup-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-loans",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-loans",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-loans",
    scanRunId: "sr-sup-baseline",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Security & Fraud (14) ─────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-b-security",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-security",
    scanRunId: "sr-sup-baseline",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-security",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-security",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Contact Support (12) ──────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SUPPORT CENTER — CURRENT AUDIT (Nov 4, 2024) — STAGNANT
  // 75 violations. Six weeks after the previous audit, nothing changed.
  // One color-contrast fix on the home page is the only movement.
  // Every other issue remains open and unassigned.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Support Home (18 = 17 remaining + 1 fixed) ────────────────────────────
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "button-name",
    count: 4,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "link-name",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 1,
    impact: "serious",
    status: "fixed",
    group: "fx",
  },
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-home",
    scanRunId: "sr-sup-rescan",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Account Help (16) ─────────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-r-accounts",
    scanRunId: "sr-sup-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-accounts",
    scanRunId: "sr-sup-rescan",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-accounts",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-accounts",
    scanRunId: "sr-sup-rescan",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-accounts",
    scanRunId: "sr-sup-rescan",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Loan Help (15) ────────────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-r-loans",
    scanRunId: "sr-sup-rescan",
    ruleId: "button-name",
    count: 3,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-loans",
    scanRunId: "sr-sup-rescan",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-loans",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-loans",
    scanRunId: "sr-sup-rescan",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-loans",
    scanRunId: "sr-sup-rescan",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },

  // ── Security & Fraud (14) ─────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-r-security",
    scanRunId: "sr-sup-rescan",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-security",
    scanRunId: "sr-sup-rescan",
    ruleId: "link-name",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-security",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 5,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-security",
    scanRunId: "sr-sup-rescan",
    ruleId: "heading-order",
    count: 3,
    impact: "moderate",
    status: "open",
  },

  // ── Contact Support (12) ──────────────────────────────────────────────────
  {
    scanPageId: "sp-sup-r-contact",
    scanRunId: "sr-sup-rescan",
    ruleId: "button-name",
    count: 2,
    impact: "critical",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-contact",
    scanRunId: "sr-sup-rescan",
    ruleId: "link-name",
    count: 3,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-contact",
    scanRunId: "sr-sup-rescan",
    ruleId: "color-contrast",
    count: 4,
    impact: "serious",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-contact",
    scanRunId: "sr-sup-rescan",
    ruleId: "heading-order",
    count: 2,
    impact: "moderate",
    status: "open",
  },
  {
    scanPageId: "sp-sup-r-contact",
    scanRunId: "sr-sup-rescan",
    ruleId: "bypass",
    count: 1,
    impact: "moderate",
    status: "open",
  },
];

export const violations: ViolationInstance[] =
  violationRegistry.flatMap(buildViolations);
