import type { ScanPage } from "@/types/domain";

/**
 * ScanPage data synchronized with the Violation Registry.
 * Each entry matches a specific page within a Scan Run.
 */
export const scanPages: ScanPage[] = [
  // ─── Marketing Site (Improvement Story) ───────────────────────────────────
  {
    id: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-home",
    violationCount: 6,
    passCount: 34,
    incompleteCount: 3,
  },
  {
    id: "sp-mkt-b-rates",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-rates",
    violationCount: 1,
    passCount: 29,
    incompleteCount: 2,
  },
  {
    id: "sp-mkt-b-about",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-about",
    violationCount: 1,
    passCount: 20,
    incompleteCount: 1,
  },
  {
    id: "sp-mkt-b-contact",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-contact",
    violationCount: 0,
    passCount: 15,
    incompleteCount: 0,
  },

  {
    id: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-home",
    violationCount: 1,
    passCount: 44,
    incompleteCount: 1,
  },
  {
    id: "sp-mkt-r-rates",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-rates",
    violationCount: 0,
    passCount: 34,
    incompleteCount: 1,
  },

  // ─── Loan Application (Regression Story) ───────────────────────────────────
  {
    id: "sp-loan-b-info",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-info",
    violationCount: 2,
    passCount: 25,
    incompleteCount: 2,
  },
  {
    id: "sp-loan-b-fin",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-fin",
    violationCount: 1,
    passCount: 22,
    incompleteCount: 2,
  },
  {
    id: "sp-loan-b-sub",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-sub",
    violationCount: 1,
    passCount: 20,
    incompleteCount: 1,
  },

  {
    id: "sp-loan-r-info",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-info",
    violationCount: 2,
    passCount: 25,
    incompleteCount: 2,
  },
  {
    id: "sp-loan-r-fin",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-fin",
    violationCount: 12,
    passCount: 10,
    incompleteCount: 4,
  },
  {
    id: "sp-loan-r-sub",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-sub",
    violationCount: 2,
    passCount: 17,
    incompleteCount: 1,
  },

  // ─── Customer Dashboard (Stagnation Story) ─────────────────────────────────
  {
    id: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-overview",
    violationCount: 2,
    passCount: 30,
    incompleteCount: 3,
  },
  {
    id: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-txn",
    violationCount: 10,
    passCount: 25,
    incompleteCount: 4,
  },
  {
    id: "sp-dash-b-stmt",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-statements",
    violationCount: 1,
    passCount: 15,
    incompleteCount: 1,
  },

  {
    id: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-overview",
    violationCount: 2,
    passCount: 31,
    incompleteCount: 3,
  },
  {
    id: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-txn",
    violationCount: 10,
    passCount: 25,
    incompleteCount: 4,
  },
  {
    id: "sp-dash-r-stmt",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-statements",
    violationCount: 1,
    passCount: 16,
    incompleteCount: 1,
  },

  // ─── Support Center (Neglected Backlog) ────────────────────────────────────
  {
    id: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-home",
    violationCount: 4,
    passCount: 26,
    incompleteCount: 2,
  },
  {
    id: "sp-sup-b-faq",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-faq",
    violationCount: 2,
    passCount: 22,
    incompleteCount: 2,
  },
  {
    id: "sp-sup-b-acc",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-accounts",
    violationCount: 1,
    passCount: 15,
    incompleteCount: 1,
  },
];
