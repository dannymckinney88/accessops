// src/lib/data/rules.ts
import type { Rule } from "@/lib/data/types/domain";

export const rules: Rule[] = [
  // ─── COLOR ──────────────────────────────────────────────────────────────────
  {
    id: "rule-color-contrast",
    ruleId: "color-contrast",
    help: "Elements must have sufficient color contrast",
    description:
      "Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=RuleDescription",
    tags: [
      "cat.color",
      "wcag2aa",
      "wcag143",
      "EN-301-549",
      "EN-9.1.4.3",
      "ACT",
    ],
    wcagCriteria: ["1.4.3"],
    category: "color",
    defaultImpact: "serious",
  },

  // ─── FORMS ──────────────────────────────────────────────────────────────────
  {
    id: "rule-label",
    ruleId: "label",
    help: "Form elements must have labels",
    description:
      "Ensures every form element has a programmatically associated label that screen readers can announce.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/label?application=RuleDescription",
    tags: [
      "cat.forms",
      "wcag2a",
      "wcag412",
      "section508",
      "section508.22.n",
      "TTv5",
      "TT5.c",
      "EN-301-549",
      "EN-9.4.1.2",
      "ACT",
    ],
    wcagCriteria: ["4.1.2"],
    category: "forms",
    defaultImpact: "critical",
  },
  {
    id: "rule-autocomplete-valid",
    ruleId: "autocomplete-valid",
    help: "autocomplete attribute must be used correctly",
    description:
      "Ensures the autocomplete attribute is correct and suitable for the form field it is used with.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/autocomplete-valid?application=RuleDescription",
    tags: [
      "cat.forms",
      "wcag21aa",
      "wcag135",
      "ACT",
      "EN-301-549",
      "EN-9.1.3.5",
    ],
    wcagCriteria: ["1.3.5"],
    category: "forms",
    defaultImpact: "serious",
  },
  {
    id: "rule-select-name",
    ruleId: "select-name",
    help: "Select element must have an accessible name",
    description:
      "Ensures select elements have an accessible name that is meaningful and available to assistive technologies.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/select-name?application=RuleDescription",
    tags: [
      "cat.forms",
      "wcag2a",
      "wcag412",
      "section508",
      "section508.22.n",
      "TTv5",
      "TT5.c",
      "EN-301-549",
      "EN-9.4.1.2",
      "ACT",
    ],
    wcagCriteria: ["4.1.2"],
    category: "forms",
    defaultImpact: "critical",
  },

  // ─── IMAGES ─────────────────────────────────────────────────────────────────
  {
    id: "rule-image-alt",
    ruleId: "image-alt",
    help: "Images must have alternate text",
    description:
      "Ensures <img> elements have alternative text or a role of none or presentation.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/image-alt?application=RuleDescription",
    tags: [
      "cat.text-alternatives",
      "wcag2a",
      "wcag111",
      "section508",
      "section508.22.a",
      "TTv5",
      "TT7.a",
      "EN-301-549",
      "EN-9.1.1.1",
      "ACT",
    ],
    wcagCriteria: ["1.1.1"],
    category: "images",
    defaultImpact: "critical",
  },
  {
    id: "rule-image-redundant-alt",
    ruleId: "image-redundant-alt",
    help: "Image alternative text should not be repeated as text",
    description:
      "Ensure image alternative text is not repeated as text near the image, which creates a redundant and potentially confusing reading experience.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/image-redundant-alt?application=RuleDescription",
    tags: ["cat.text-alternatives", "best-practice"],
    wcagCriteria: [],
    category: "images",
    defaultImpact: "minor",
  },

  // ─── KEYBOARD ───────────────────────────────────────────────────────────────
  {
    id: "rule-tabindex",
    ruleId: "tabindex",
    help: "Elements should not have tabindex greater than zero",
    description:
      "Ensures that tabindex attribute values are not greater than 0, which disrupts the natural tab order for keyboard users.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/tabindex?application=RuleDescription",
    tags: ["cat.keyboard", "best-practice", "TTv5", "TT4.a"],
    wcagCriteria: [],
    category: "keyboard",
    defaultImpact: "serious",
  },
  {
    id: "rule-scrollable-region-focusable",
    ruleId: "scrollable-region-focusable",
    help: "Scrollable region must have keyboard access",
    description:
      "Ensure elements that have scrollable content are accessible by keyboard, allowing users who cannot use a mouse to access the content.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/scrollable-region-focusable?application=RuleDescription",
    tags: ["cat.keyboard", "wcag2a", "wcag211", "EN-301-549", "EN-9.2.1.1"],
    wcagCriteria: ["2.1.1"],
    category: "keyboard",
    defaultImpact: "serious",
  },

  // ─── STRUCTURE ──────────────────────────────────────────────────────────────
  {
    id: "rule-heading-order",
    ruleId: "heading-order",
    help: "Heading levels should only increase by one",
    description:
      "Ensures the order of headings is semantically correct and does not skip levels, which disrupts the document outline for screen reader users.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/heading-order?application=RuleDescription",
    tags: ["cat.semantics", "best-practice", "TTv5", "TT12.b"],
    wcagCriteria: [],
    category: "structure",
    defaultImpact: "moderate",
  },
  {
    id: "rule-landmark-one-main",
    ruleId: "landmark-one-main",
    help: "Document must have one main landmark",
    description:
      "Ensures the document has a main landmark, allowing screen reader users to quickly navigate to the primary content.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=RuleDescription",
    tags: ["cat.semantics", "best-practice", "TTv5", "TT11.a"],
    wcagCriteria: [],
    category: "structure",
    defaultImpact: "moderate",
  },
  {
    id: "rule-bypass",
    ruleId: "bypass",
    help: "Page must have means to bypass repeated blocks",
    description:
      "Ensures each page has at least one mechanism for a user to bypass navigation and jump straight to the content.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/bypass?application=RuleDescription",
    tags: [
      "cat.keyboard",
      "wcag2a",
      "wcag241",
      "section508",
      "section508.22.o",
      "TTv5",
      "TT9.a",
      "EN-301-549",
      "EN-9.2.4.1",
    ],
    wcagCriteria: ["2.4.1"],
    category: "structure",
    defaultImpact: "moderate",
  },

  // ─── ARIA ────────────────────────────────────────────────────────────────────
  {
    id: "rule-aria-required-attr",
    ruleId: "aria-required-attr",
    help: "Required ARIA attributes must be provided",
    description:
      "Ensures elements with ARIA roles have all required attributes for that role, without which assistive technologies cannot interpret the element correctly.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/aria-required-attr?application=RuleDescription",
    tags: ["cat.aria", "wcag2a", "wcag412", "EN-301-549", "EN-9.4.1.2"],
    wcagCriteria: ["4.1.2"],
    category: "aria",
    defaultImpact: "critical",
  },
  {
    id: "rule-aria-roles",
    ruleId: "aria-roles",
    help: "ARIA roles used must conform to valid values",
    description:
      "Ensures all elements with a role attribute use a valid value, preventing assistive technologies from receiving incorrect semantic information.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/aria-roles?application=RuleDescription",
    tags: ["cat.aria", "wcag2a", "wcag412", "EN-301-549", "EN-9.4.1.2", "ACT"],
    wcagCriteria: ["4.1.2"],
    category: "aria",
    defaultImpact: "critical",
  },
  {
    id: "rule-aria-hidden-focus",
    ruleId: "aria-hidden-focus",
    help: "ARIA hidden element must not contain focusable elements",
    description:
      "Ensures that aria-hidden elements do not contain focusable elements, which would leave keyboard users stranded on elements invisible to screen readers.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/aria-hidden-focus?application=RuleDescription",
    tags: [
      "cat.name-role-value",
      "wcag2a",
      "wcag412",
      "TTv5",
      "TT6.a",
      "EN-301-549",
      "EN-9.4.1.2",
      "ACT",
    ],
    wcagCriteria: ["4.1.2"],
    category: "aria",
    defaultImpact: "serious",
  },

  // ─── NAMES & LABELS ──────────────────────────────────────────────────────────
  {
    id: "rule-button-name",
    ruleId: "button-name",
    help: "Buttons must have discernible text",
    description:
      "Ensures buttons have discernible text so that screen readers can announce a meaningful label when a user focuses on the button.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/button-name?application=RuleDescription",
    tags: [
      "cat.name-role-value",
      "wcag2a",
      "wcag412",
      "section508",
      "section508.22.a",
      "TTv5",
      "TT6.a",
      "EN-301-549",
      "EN-9.4.1.2",
      "ACT",
    ],
    wcagCriteria: ["4.1.2"],
    category: "names-and-labels",
    defaultImpact: "critical",
  },
  {
    id: "rule-link-name",
    ruleId: "link-name",
    help: "Links must have discernible text",
    description:
      "Ensures links have discernible text so that screen readers can announce a meaningful label, and keyboard users understand the link destination.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/link-name?application=RuleDescription",
    tags: [
      "cat.name-role-value",
      "wcag2a",
      "wcag244",
      "wcag412",
      "section508",
      "section508.22.a",
      "TTv5",
      "TT6.a",
      "EN-301-549",
      "EN-9.2.4.4",
      "EN-9.4.1.2",
      "ACT",
    ],
    wcagCriteria: ["2.4.4", "4.1.2"],
    category: "names-and-labels",
    defaultImpact: "serious",
  },

  // ─── TABLES ──────────────────────────────────────────────────────────────────
  {
    id: "rule-td-headers-attr",
    ruleId: "td-headers-attr",
    help: "Table cells that use the headers attribute must only refer to th elements",
    description:
      "Ensures that each cell in a table using the headers attribute correctly references only <th> elements in the same table, enabling screen readers to announce proper row and column context.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/td-headers-attr?application=RuleDescription",
    tags: [
      "cat.tables",
      "wcag2a",
      "wcag131",
      "section508",
      "section508.22.g",
      "TTv5",
      "TT14.b",
      "EN-301-549",
      "EN-9.1.3.1",
    ],
    wcagCriteria: ["1.3.1"],
    category: "tables",
    defaultImpact: "serious",
  },
  {
    id: "rule-th-has-data-cells",
    ruleId: "th-has-data-cells",
    help: "Table headers in a data table must refer to data cells",
    description:
      "Ensures that <th> elements and elements with role=columnheader/rowheader have data cells they describe, so that screen reader table navigation mode functions correctly.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/th-has-data-cells?application=RuleDescription",
    tags: [
      "cat.tables",
      "wcag2a",
      "wcag131",
      "section508",
      "section508.22.g",
      "TTv5",
      "TT14.b",
      "EN-301-549",
      "EN-9.1.3.1",
    ],
    wcagCriteria: ["1.3.1"],
    category: "tables",
    defaultImpact: "serious",
  },
  {
    id: "rule-scope-attr-valid",
    ruleId: "scope-attr-valid",
    help: "scope attribute must be used correctly on tables",
    description:
      "Ensures the scope attribute is used correctly on tables so that screen readers can correctly announce column and row header relationships during table navigation.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/scope-attr-valid?application=RuleDescription",
    tags: ["cat.tables", "best-practice", "EN-301-549"],
    wcagCriteria: [],
    category: "tables",
    defaultImpact: "moderate",
  },
  {
    id: "rule-table-duplicate-name",
    ruleId: "table-duplicate-name",
    help: "Tables should not have the same summary and caption",
    description:
      "Ensures that tables do not use the same text for both the summary attribute and the caption element, which creates a redundant and potentially confusing screen reader experience.",
    helpUrl:
      "https://dequeuniversity.com/rules/axe/4.11/table-duplicate-name?application=RuleDescription",
    tags: ["cat.tables", "best-practice"],
    wcagCriteria: [],
    category: "tables",
    defaultImpact: "minor",
  },
];
