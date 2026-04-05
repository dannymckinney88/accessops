# AccessOps

AccessOps is an accessibility operations platform built around a gap I kept seeing in real accessibility work:

**finding issues is not the hard part — managing remediation is.**

Most accessibility tools are good at detection.
Far fewer are built to help teams turn an audit into focused, trackable engineering work.

AccessOps turns an accessibility audit into a **working remediation backlog** so teams can prioritize risk, assign work, fix issues, and verify what is actually resolved.

## Live Demo

[Explore AccessOps](https://accessops.vercel.app/dashboard)

---

## Why I Built It

A lot of accessibility tooling stops at reporting.

You get a scan, a list of violations, maybe a score, maybe an export.

But in practice, that is where the real work starts.

Teams still need to answer questions like:

- What should we fix first?
- Where is risk concentrated right now?
- Which issues are repeated across pages?
- What is actively being worked?
- What is fixed but still waiting on verification?

This is **not** a scanner UI.
This is a **remediation system**.

---

## Product Model

AccessOps uses a **single active audit** model.

That means:

- one audit defines the current backlog
- all remediation work happens against that audit
- issues move through a lifecycle as teams work them
- future audits confirm what was actually resolved

### Issue lifecycle

- Open
- In Progress
- Fixed
- Verified
- Accepted Risk

> **What needs to be fixed right now?**

That is the core product question.

---

## Accessibility

Because the product is about accessibility operations, the implementation reflects the same discipline.

That includes:

- semantic HTML throughout — tables are real tables, lists are real lists
- keyboard-first interaction patterns across filters, tables, and drawers
- focus management on drawer open and close, with priority-ordered restore logic
- visible focus states on every interactive element
- proper ARIA roles, labels, and live regions
- sort state exposed to screen readers via `aria-sort` and `aria-describedby`
- no color-only meaning

The filter components implement full focus trapping, Escape-to-close, and screen reader status announcements. The table header exposes sort direction and next action separately from the column name to avoid redundant announcements on associated cells.

---

## Product Surfaces

### Dashboard — Decision Surface

<br>

![Dashboard View](public/assets/screenshots/dashboard.png)

<br>

The Dashboard is focused on current audit state only.

It helps teams understand:

- what still needs to be fixed
- where risk is concentrated
- which property needs attention first

---

### Issues — Remediation Workspace

<br>

![Issues Table](public/assets/screenshots/issues.png)

<br>

The Issues screen is the core product.

Instead of treating accessibility findings like raw scan output, AccessOps treats them like **work items in an engineering backlog**.

Key behaviors include:

- filtering across severity, status, property, page, rule, and assignee
- flat and grouped workflows depending on remediation strategy
- repeated issue visibility to expose high-leverage fixes
- assignment and status management directly in the workflow

#### Grouped by Page

<br>

![Issues Grouped by Page](public/assets/screenshots/issues-grouped-page.png)

<br>

Grouping helps teams work more strategically by surfacing issue concentration at the page level while preserving actionable rows underneath.

#### Bulk Actions

<br>

![Bulk Actions](public/assets/screenshots/issues-bulk-actions.png)

<br>

Bulk actions reduce workflow friction when assigning or updating multiple issues at once.

#### Issue Detail Drawer

<br>

![Issue Detail Drawer](public/assets/screenshots/issues-drawer.png)

<br>

The detail drawer turns an issue from "audit output" into something actionable.

It gives engineers the context they need:

- why the issue matters
- who is impacted
- what failed
- where it appears
- how to fix it
- how to update status and ownership

---

### Scans — Audit History

<br>

![Scans View](public/assets/screenshots/scans.png)

<br>

Scans is intentionally lightweight.

- the current audit is the entry point into active remediation
- previous audits are summary-only
- historical scans support traceability without competing with the Issues workflow

---

### Mobile

<br>

![Mobile Dashboard](public/assets/screenshots/mobile-dash.png)

<br>

AccessOps is desktop-first because remediation work is data-heavy, but it remains usable on smaller screens.

---

## Example Workflow

1. A team receives a new accessibility audit
2. That audit becomes the **active backlog**
3. Dashboard highlights where risk is concentrated
4. Engineers work issues through the Issues screen
5. Issues move from Open / In Progress to Fixed
6. A future audit verifies what is actually resolved

**audit → triage → remediation → verification**

---

## Seeded Data Strategy

The demo data is intentionally structured to simulate a realistic enterprise accessibility program.

Each property tells a different story:

- **Marketing Site** → healthier state, strong remediation progress
- **Loan Application** → highest risk, regression-heavy, largest backlog
- **Customer Dashboard** → active remediation with mixed progress
- **Support Center** → smaller stagnant backlog

---

## Technical Notes

A few decisions worth explaining:

**Hook separation by concern** — the Issues workspace is split across `useIssueMutations`, `useIssueFilters`, `useIssueDerivedData`, `useIssueWorkspaceState`, `useIssueSelection`, and `useGroupedPageData`. Each hook owns exactly one thing. This made the workspace significantly easier to reason about as complexity grew.

**URL-synced filter state** — shareable filter state (property, page, rule, assignee, search) is synced to the URL so links work as expected. Severity and status stay session-local intentionally — the screen opens unfiltered, with active work surfaced by default sort order rather than persisted filter params.

**Client-side override persistence** — assignment and status changes are persisted to `localStorage` and applied after mount to avoid hydration mismatches with server output. `applyOverrides` returns the same reference when the override map is empty, so React bails out with no re-render in a fresh session.

**TanStack Table over a simpler solution** — the Issues screen needed multi-column sorting, pagination, stable row identity across sort changes, and custom sort functions per column (severity and status use domain-specific order maps, not lexicographic sort). TanStack Table handles all of this without fighting it.

**Async data layer without a backend** — all data access is async by convention even though the current layer is seeded. This means swapping in a real API requires no changes to consuming code.

---

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui + Radix
- TanStack Table
- Recharts

---

## Getting Started

```bash
npm install
npm run dev
npm run build
```
