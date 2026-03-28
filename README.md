# AccessOps

AccessOps is a production-minded accessibility operations dashboard built to simulate how teams **triage, prioritize, and remediate accessibility issues after an audit**.

This project is meant to feel like a real internal tool — not a scanner UI or a generic analytics dashboard.

---

## Why I’m Building This

I wanted to build something that better reflects the kind of frontend and accessibility work I’ve done in real enterprise environments.

Instead of creating another audit form or “metrics dashboard,” this project focuses on the **operational side of accessibility**:

- understanding what still needs to be fixed
- prioritizing high-risk accessibility issues
- tracking remediation progress across teams
- validating what has actually been resolved

The goal is to demonstrate strong product thinking, frontend architecture, and accessibility-first implementation in a realistic internal-tool workflow.

---

## Product Model

AccessOps follows an **audit-driven remediation model**, not continuous monitoring.

- An audit establishes a baseline of issues
- Teams work through remediation over time
- Issues move through lifecycle states:
  - Open
  - In Progress
  - Fixed
  - Verified
  - Accepted Risk
- A future audit verifies what is truly resolved

The system represents **work remaining**, not just what a scan found.

---

## MVP Scope

The MVP is focused on four core product areas:

- **Dashboard** — current audit state and remediation progress (what still needs to be fixed)
- **Issues** — triage workspace for managing violations
- **Scans** — audit and re-audit records
- **Compare** — audit-to-audit comparison (what changed, what was resolved)

---

## Dashboard Direction

The dashboard is a **current-state decision surface**, not a historical analytics view.

It answers:

- Where is current risk concentrated?
- What still needs to be fixed?
- What progress has been made?

It intentionally does **not** show:

- trend charts
- time-series analysis
- scan-over-scan history

### Current Dashboard Features

- lifecycle-based summary signals:
  - Unfixed
  - Critical Unfixed
  - Fixed (awaiting verification)
  - Verified
- audit progress visualization (including accepted risk)
- severity distribution (scoped to remaining work)
- property health ranking (based on unfixed issues)
- right-column action panels:
  - critical risk alert
  - “needs attention now” focus area

---

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- lucide-react
- TanStack Table
- Recharts

---

## Project Direction

This project is intentionally **frontend-first**.

- seeded/mock data first
- async data-access layer (no direct data imports in components)
- no Redux unless clearly justified
- UI built around real workflows before backend concerns

The goal is to establish strong product and UI architecture before introducing persistence.

---

## Accessibility Approach

Accessibility is treated as a first-class requirement.

- semantic HTML first
- full keyboard accessibility
- visible focus states
- proper labeling and ARIA usage
- accessible tables, filters, and drawers
- explainability for every issue (why it matters, who is impacted, how to fix)

Because the product is about accessibility, the UI itself must be credible.

---

## Data Model

Core entities:

- `Property`
- `Page`
- `ScanRun`
- `ScanPage`
- `Rule`
- `ViolationInstance`

Derived models:

- hydrated violations (for Issues page)
- property health summaries (for Dashboard)
- compare results (for audit comparisons)

All data access flows through a centralized async layer.

---

## Current Status

### ✅ Issues (complete)

- semantic, accessible data table
- additive filters (property, severity, status, search)
- keyboard-accessible row interaction
- URL-driven detail drawer with focus management
- explainability content integrated into every issue

### 🚧 Dashboard (in progress)

- lifecycle-driven current-state signals
- audit progress visualization
- severity distribution (remaining work)
- property health ranking
- right-column action panels (risk + attention focus)

Next steps:

- layout refinement (desktop width and spacing)
- visual polish and consistency
- scans and compare workflows

---

## Getting Started

```bash
npm install
npm run dev
```
