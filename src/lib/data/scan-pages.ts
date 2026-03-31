// src/lib/data/scan-pages.ts
//
// One ScanPage per page covered in each vendor audit or rescan.
// violationCount matches the number of ViolationInstances for that page in violations.ts.
// All pageIds reference real entries in pages.ts.

import type { ScanPage } from "@/types/domain";

export const scanPages: ScanPage[] = [
  // ─── Marketing Site — Baseline (Sep 15, 2024) ────────────────────────────
  // 7 violations total. Most are now fixed or verified — major improvement.
  {
    id: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-home",
    violationCount: 4,
    passCount: 38,
    incompleteCount: 2,
  },
  {
    id: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-personal",
    violationCount: 3,
    passCount: 32,
    incompleteCount: 1,
  },

  // ─── Marketing Site — Rescan (Feb 12, 2025) ──────────────────────────────
  // 3 violations remain. Improvement confirmed — far fewer findings.
  {
    id: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-home",
    violationCount: 2,
    passCount: 44,
    incompleteCount: 1,
  },
  {
    id: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-personal",
    violationCount: 1,
    passCount: 36,
    incompleteCount: 0,
  },

  // ─── Loan Application — Baseline (Sep 18, 2024) ──────────────────────────
  // 4 violations. Form issues present before the November regression.
  {
    id: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-personal",
    violationCount: 2,
    passCount: 26,
    incompleteCount: 1,
  },
  {
    id: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-employment",
    violationCount: 1,
    passCount: 24,
    incompleteCount: 1,
  },
  {
    id: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-review",
    violationCount: 1,
    passCount: 20,
    incompleteCount: 0,
  },

  // ─── Loan Application — Rescan (Jan 30, 2025) ────────────────────────────
  // 14 violations — severe regression. A November 2024 deploy introduced a new
  // form component that broke label associations across the entire flow.
  // All violations are open; team is in active crisis response.
  {
    id: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-personal",
    violationCount: 5,
    passCount: 20,
    incompleteCount: 2,
  },
  {
    id: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-employment",
    violationCount: 5,
    passCount: 18,
    incompleteCount: 2,
  },
  {
    id: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-review",
    violationCount: 4,
    passCount: 17,
    incompleteCount: 1,
  },

  // ─── Customer Dashboard — Baseline (Sep 20, 2024) ────────────────────────
  // 7 violations. Table and button accessibility failures — high-risk debt.
  {
    id: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-overview",
    violationCount: 2,
    passCount: 34,
    incompleteCount: 2,
  },
  {
    id: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-accounts",
    violationCount: 2,
    passCount: 31,
    incompleteCount: 1,
  },
  {
    id: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-txn",
    violationCount: 3,
    passCount: 29,
    incompleteCount: 2,
  },

  // ─── Customer Dashboard — Rescan (Mar 5, 2025) ───────────────────────────
  // 7 violations — same count as baseline. Minimal progress. Team stagnant.
  {
    id: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-overview",
    violationCount: 2,
    passCount: 35,
    incompleteCount: 2,
  },
  {
    id: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-accounts",
    violationCount: 2,
    passCount: 32,
    incompleteCount: 1,
  },
  {
    id: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-txn",
    violationCount: 3,
    passCount: 29,
    incompleteCount: 2,
  },

  // ─── Support Center — Baseline (Sep 22, 2024) ────────────────────────────
  // 6 violations. No rescan commissioned. Issues remain unaddressed.
  {
    id: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-home",
    violationCount: 2,
    passCount: 28,
    incompleteCount: 1,
  },
  {
    id: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-accounts",
    violationCount: 2,
    passCount: 25,
    incompleteCount: 1,
  },
  {
    id: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-contact",
    violationCount: 2,
    passCount: 22,
    incompleteCount: 0,
  },
];
