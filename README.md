# AccessOps

AccessOps is a production-minded accessibility operations dashboard built to simulate how teams monitor scan health, triage WCAG violations, track remediation progress, and compare results across properties over time.

This project is meant to feel like a real internal product, not just another scanner form or fake analytics dashboard.

## Why I’m Building This

I wanted to build something that better reflects the kind of frontend and accessibility work I’ve done in real enterprise environments.

Instead of creating another generic dashboard or a simple audit form, this project focuses on the operational side of accessibility:

- tracking accessibility health across multiple properties
- reviewing violations in context
- managing remediation status
- comparing scan results over time
- surfacing regressions and improvement trends

The goal is to show stronger product thinking, frontend architecture, accessibility-first implementation, and more realistic internal-tool UX.

## MVP Scope

The initial MVP is focused on four core product areas:

- **Dashboard** — accessibility health overview including summary signals, issue trends, severity distribution, and property-level risk ranking
- **Scans** — scan history and scan-level drill-down views
- **Issues** — triage-focused violation management with filters and detail views
- **Compare** — side-by-side scan comparison to show new, resolved, and unchanged issues

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
- React Hook Form
- Zod

## Project Direction

This project is intentionally **frontend-first**.

The current approach is:

- seeded/mock data first
- no heavy backend in the early phase
- no Redux unless real complexity justifies it later
- async data-access wrappers to keep the UI decoupled from the underlying data source
- derived selectors and view-model shaping for dashboard, issue, and compare workflows

The goal is to build the product model and user workflows first, then decide later whether a mock API or real backend adds meaningful value.

## Accessibility Approach

Accessibility is not being treated as a final QA step.

Because the product itself is centered around accessibility operations, the UI needs to reflect that from the start:

- semantic HTML first
- keyboard-accessible interactions
- visible focus states
- accessible names and labels
- careful handling of tables, filters, drawers, and status messaging
- responsive without sacrificing desktop usability for a data-heavy workflow

This app is designed primarily for desktop use, but it should still scale down responsibly.

## Data Model

The app is built around a normalized domain model:

- `Property`
- `Page`
- `ScanRun`
- `ScanPage`
- `Rule`
- `ViolationInstance`

From there, the project derives richer, UI-ready models for things like:

- hydrated issue records
- property health summaries
- compare results
- workflow-oriented dashboard data

That separation helps keep the core data model clean while still making the UI easier to build.

## Current Status

The Issues workflow is complete and behaves like a real triage tool, including:

- additive filters (status, severity, property)
- semantic table with sorting and pagination
- keyboard-accessible row interaction
- URL-driven detail drawer with focus management
- explainability content (why it matters, who is impacted, how to fix)

The Dashboard is in active development and currently includes:

- summary signals (total issues, critical issues, affected properties)
- issue trend visualization with time-range controls (7d, 30d, 90d, all)
- severity distribution
- property health ranking based on issue volume

Ongoing work is focused on:

- refining dashboard data meaning and scope
- improving trend data fidelity
- expanding seeded data for more realistic scenarios

## Getting Started

Clone the repo and install dependencies:

````bash
npm install
Run the development server:

```bash
npm run dev
````

Run linting:

```bash
npm run lint
```

Format the codebase:

```bash
npm run format
```
