import type { ScanPage } from "../types/domain";

export const scanPages: ScanPage[] = [
  // ─── Marketing Site — Baseline (Sep 15, 2024) ────────────────────────────
  // Story: Team was proactive early — most issues already verified or fixed
  {
    id: "sp-mkt-b-home",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-home",
    totalIssues: 4,
    resolvedIssues: 3,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
  {
    id: "sp-mkt-b-personal",
    scanRunId: "sr-mkt-baseline",
    pageId: "page-mkt-personal",
    totalIssues: 3,
    resolvedIssues: 3,
    remainingIssues: 0,
    criticalRemaining: 0,
  },

  // ─── Marketing Site — Rescan (Feb 12, 2025) ──────────────────────────────
  // Story: Nearly clean — 2 minor remaining, 1 already fixed
  {
    id: "sp-mkt-r-home",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-home",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 0,
  },
  {
    id: "sp-mkt-r-personal",
    scanRunId: "sr-mkt-rescan",
    pageId: "page-mkt-personal",
    totalIssues: 1,
    resolvedIssues: 1,
    remainingIssues: 0,
    criticalRemaining: 0,
  },

  // ─── Loan Application — Baseline (Sep 18, 2024) ──────────────────────────
  // Story: Pre-regression, manageable issues with some remediation
  {
    id: "sp-loan-b-personal",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-personal",
    totalIssues: 2,
    resolvedIssues: 1,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
  {
    id: "sp-loan-b-employment",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-employment",
    totalIssues: 1,
    resolvedIssues: 0,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
  {
    id: "sp-loan-b-review",
    scanRunId: "sr-loan-baseline",
    pageId: "page-loan-review",
    totalIssues: 1,
    resolvedIssues: 0,
    remainingIssues: 1,
    criticalRemaining: 0,
  },

  // ─── Loan Application — Rescan (Jan 30, 2025) ────────────────────────────
  // Story: Regression — deploy broke label associations across entire flow
  {
    id: "sp-loan-r-personal",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-personal",
    totalIssues: 5,
    resolvedIssues: 0,
    remainingIssues: 5,
    criticalRemaining: 3,
  },
  {
    id: "sp-loan-r-employment",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-employment",
    totalIssues: 5,
    resolvedIssues: 0,
    remainingIssues: 5,
    criticalRemaining: 4,
  },
  {
    id: "sp-loan-r-review",
    scanRunId: "sr-loan-rescan",
    pageId: "page-loan-review",
    totalIssues: 4,
    resolvedIssues: 0,
    remainingIssues: 4,
    criticalRemaining: 3,
  },

  // ─── Customer Dashboard — Baseline (Sep 20, 2024) ────────────────────────
  // Story: High-risk debt, some fixes attempted but criticals persist
  {
    id: "sp-dash-b-overview",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-overview",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-b-accounts",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-accounts",
    totalIssues: 2,
    resolvedIssues: 1,
    remainingIssues: 1,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-b-txn",
    scanRunId: "sr-dash-baseline",
    pageId: "page-app-txn",
    totalIssues: 3,
    resolvedIssues: 1,
    remainingIssues: 2,
    criticalRemaining: 2,
  },

  // ─── Customer Dashboard — Rescan (Mar 5, 2025) ───────────────────────────
  // Story: Stagnant — same violations, team made no meaningful progress
  {
    id: "sp-dash-r-overview",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-overview",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-r-accounts",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-accounts",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-dash-r-txn",
    scanRunId: "sr-dash-rescan",
    pageId: "page-app-txn",
    totalIssues: 3,
    resolvedIssues: 0,
    remainingIssues: 3,
    criticalRemaining: 1,
  },

  // ─── Support Center — Baseline (Sep 22, 2024) ────────────────────────────
  // Story: Neglected — no rescan, one minor fix, everything else untouched
  {
    id: "sp-sup-b-home",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-home",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-sup-b-accounts",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-accounts",
    totalIssues: 2,
    resolvedIssues: 0,
    remainingIssues: 2,
    criticalRemaining: 1,
  },
  {
    id: "sp-sup-b-contact",
    scanRunId: "sr-sup-baseline",
    pageId: "page-sup-contact",
    totalIssues: 2,
    resolvedIssues: 1,
    remainingIssues: 1,
    criticalRemaining: 0,
  },
];
