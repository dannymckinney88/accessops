// src/lib/data/scan-runs.ts
//
// Scan cadence reflects a realistic external vendor audit model:
// one baseline audit per property in Sep 2024, followed by optional rescans
// commissioned per-property based on remediation progress and risk.
//
// Marketing Site:   Baseline Sep 2024 → Rescan Feb 2025 (team improved significantly)
// Loan Application: Baseline Sep 2024 → Rescan Jan 2025 (regression discovered — worse)
// Customer Dashboard: Baseline Sep 2024 → Rescan Mar 2025 (barely moved — stagnant)
// Support Center:   Baseline Sep 2024 only (team has not commissioned a rescan)

import type { ScanRun } from "@/types/domain";

export const scanRuns: ScanRun[] = [
  // ─── Marketing Site ───────────────────────────────────────────────────────
  {
    id: "sr-mkt-baseline",
    propertyId: "prop-marketing",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-15T09:00:00.000Z",
    completedAt: "2024-09-15T09:18:33.000Z",
  },
  {
    id: "sr-mkt-rescan",
    propertyId: "prop-marketing",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-02-12T10:00:00.000Z",
    completedAt: "2025-02-12T10:14:47.000Z",
  },

  // ─── Loan Application ─────────────────────────────────────────────────────
  // A November 2024 deploy introduced a new form component that broke label
  // associations and autocomplete across the full application flow.
  // The rescan was commissioned urgently after internal QA flagged the failures.
  {
    id: "sr-loan-baseline",
    propertyId: "prop-loan-app",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-18T09:00:00.000Z",
    completedAt: "2024-09-18T09:21:04.000Z",
  },
  {
    id: "sr-loan-rescan",
    propertyId: "prop-loan-app",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-01-30T09:00:00.000Z",
    completedAt: "2025-01-30T09:23:51.000Z",
  },

  // ─── Customer Dashboard ───────────────────────────────────────────────────
  {
    id: "sr-dash-baseline",
    propertyId: "prop-dashboard",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-20T09:00:00.000Z",
    completedAt: "2024-09-20T09:24:16.000Z",
  },
  {
    id: "sr-dash-rescan",
    propertyId: "prop-dashboard",
    status: "completed",
    pageCount: 5,
    triggeredBy: "vendor-rescan",
    initiatedAt: "2025-03-05T09:00:00.000Z",
    completedAt: "2025-03-05T09:22:38.000Z",
  },

  // ─── Support Center ───────────────────────────────────────────────────────
  // Team has not prioritized accessibility remediation.
  // No rescan has been commissioned. Violations remain unaddressed.
  {
    id: "sr-sup-baseline",
    propertyId: "prop-support",
    status: "completed",
    pageCount: 4,
    triggeredBy: "vendor-audit",
    initiatedAt: "2024-09-22T09:00:00.000Z",
    completedAt: "2024-09-22T09:16:29.000Z",
  },
];
