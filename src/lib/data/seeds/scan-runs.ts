// src/lib/data/scan-runs.ts
//
// Two audit checkpoints per property: a previous audit (Sep 2024) and a
// current audit. Dates reinforce each property story.
//
// Marketing Site:      Previous audit Sep 15 2024 → Current audit Feb 12 2025
//                      Team used the remediation window well. Feb scan shows
//                      dramatic improvement — nearly clean.
//
// Loan Application:    Previous audit Sep 18 2024 → Current audit Jan 30 2025
//                      A Nov 2024 deploy introduced a broken form component.
//                      Label associations, autocomplete, and select-name fail
//                      across the full 8-step application flow. Urgent.
//
// Customer Dashboard:  Previous audit Sep 20 2024 → Current audit Mar 5 2025
//                      Team is aware and actively working the backlog, but
//                      progress is slow. High debt persists with visible
//                      in-progress and fixed movement in the current scan.
//
// Support Center:      Previous audit Sep 22 2024 → Current audit Nov 4 2024
//                      Team commissioned a follow-up after six weeks.
//                      Nothing was fixed. Issues unchanged.

import type { ScanRun } from "@/lib/data/types/domain";

export const scanRuns: ScanRun[] = [
  // ─── Marketing Site ───────────────────────────────────────────────────────
  {
    id: "sr-mkt-baseline",
    propertyId: "prop-marketing",
    status: "completed",
    pageCount: 8,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-15T09:00:00.000Z",
    completedAt: "2024-09-15T09:42:18.000Z",
  },
  {
    id: "sr-mkt-rescan",
    propertyId: "prop-marketing",
    status: "completed",
    pageCount: 8,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-02-12T10:00:00.000Z",
    completedAt: "2025-02-12T10:38:54.000Z",
  },

  // ─── Loan Application ─────────────────────────────────────────────────────
  // Nov 2024 deploy broke form accessibility across the entire application
  // flow. Rescan commissioned urgently after internal QA flagged failures.
  {
    id: "sr-loan-baseline",
    propertyId: "prop-loan-app",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-18T09:00:00.000Z",
    completedAt: "2024-09-18T09:31:04.000Z",
  },
  {
    id: "sr-loan-rescan",
    propertyId: "prop-loan-app",
    status: "completed",
    pageCount: 8,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-01-30T09:00:00.000Z",
    completedAt: "2025-01-30T09:48:22.000Z",
  },

  // ─── Customer Dashboard ───────────────────────────────────────────────────
  {
    id: "sr-dash-baseline",
    propertyId: "prop-dashboard",
    status: "completed",
    pageCount: 7,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-20T09:00:00.000Z",
    completedAt: "2024-09-20T09:44:16.000Z",
  },
  {
    id: "sr-dash-rescan",
    propertyId: "prop-dashboard",
    status: "completed",
    pageCount: 7,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-03-05T09:00:00.000Z",
    completedAt: "2025-03-05T09:51:33.000Z",
  },

  // ─── Support Center ───────────────────────────────────────────────────────
  // Team commissioned a follow-up six weeks after the previous audit.
  // No remediation work occurred in the intervening period.
  {
    id: "sr-sup-baseline",
    propertyId: "prop-support",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-22T09:00:00.000Z",
    completedAt: "2024-09-22T09:36:29.000Z",
  },
  {
    id: "sr-sup-rescan",
    propertyId: "prop-support",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2024-11-04T09:00:00.000Z",
    completedAt: "2024-11-04T09:34:11.000Z",
  },
];
