// src/lib/data/scan-pages.ts
//
// One ScanPage per page covered in each vendor audit or rescan.
// Properties match the updated ScanPage interface in domain.ts.
// All pageIds reference real entries in pages.ts.

import type { ScanPage } from "../types/domain";

export const scanPages: ScanPage[] = [
  // ─── Marketing Site — Baseline (Sep 15, 2024) ────────────────────────────
  {
    id: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-home",
    totalIssues: 4,
    resolvedIssues: 38,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-personal",
    totalIssues: 3,
    resolvedIssues: 32,
    remainingIssues: 1,
    criticalRemaining: 0,
  },

  // ─── Marketing Site — Rescan (Feb 12, 2025) ──────────────────────────────
  {
    id: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-home",
    totalIssues: 2,
    resolvedIssues: 40,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
  {
    id: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-personal",
    totalIssues: 1,
    resolvedIssues: 34,
    remainingIssues: 0,
    criticalRemaining: 0,
  },

  // ─── Loan Application — Baseline (Oct 20, 2024) ──────────────────────────
  {
    id: "sp-loan-b-home",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-home",
    totalIssues: 2,
    resolvedIssues: 25,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
  {
    id: "sp-loan-b-app",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-app",
    totalIssues: 2,
    resolvedIssues: 22,
    remainingIssues: 1,
    criticalRemaining: 1,
  },

  // ─── Loan Application — Rescan (Jan 15, 2025) ────────────────────────────
  {
    id: "sp-loan-r-home",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-home",
    totalIssues: 6,
    resolvedIssues: 21,
    remainingIssues: 4,
    criticalRemaining: 1,
  },
  {
    id: "sp-loan-r-app",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-app",
    totalIssues: 8,
    resolvedIssues: 16,
    remainingIssues: 6,
    criticalRemaining: 2,
  },

  // ─── Customer Dashboard — Baseline (Nov 10, 2024) ────────────────────────
  {
    id: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-overview",
    totalIssues: 2,
    resolvedIssues: 35,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-accounts",
    totalIssues: 2,
    resolvedIssues: 32,
    remainingIssues: 1,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-txn",
    totalIssues: 3,
    resolvedIssues: 29,
    remainingIssues: 2,
    criticalRemaining: 1,
  },

  // ─── Customer Dashboard — Rescan (Mar 5, 2025) ───────────────────────────
  {
    id: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-overview",
    totalIssues: 2,
    resolvedIssues: 35,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-accounts",
    totalIssues: 2,
    resolvedIssues: 32,
    remainingIssues: 1,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-txn",
    totalIssues: 3,
    resolvedIssues: 29,
    remainingIssues: 2,
    criticalRemaining: 1,
  },

  // ─── Support Center — Baseline (Sep 22, 2024) ────────────────────────────
  {
    id: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-home",
    totalIssues: 2,
    resolvedIssues: 18,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-accounts",
    totalIssues: 2,
    resolvedIssues: 15,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-sup-b-article",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-article",
    totalIssues: 2,
    resolvedIssues: 22,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
];
