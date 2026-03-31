# AccessOps

AccessOps is an accessibility operations platform focused on **triage, remediation, and verification** — not just scanning.

AccessOps is an accessibility operations platform designed to manage what happens after an audit — **prioritizing issues, driving remediation, and verifying** fixes over time.

It focuses on real workflow, not just reporting.
**Audit → Triage → Fix → Re-audit → Verify.**

---

## 🎯 Purpose

Most accessibility tools stop at reporting issues. AccessOps focuses on what happens after:

- **Prioritizing Real Risk:** Moving beyond raw issue counts to business impact.
- **Managing Remediation:** A dedicated workspace for tracking "In Progress" work.
- **Audit Persistence:** Tracking the same issue across multiple scan cycles.
- **Verification:** Closing the loop by confirming fixes in subsequent audits.
- **Who Is This For:** Designed for internal engineering and accessibility teams working on complex, data-heavy applications.

---

## 🔁 Example Workflow

1. A new scan detects a regression in the Loan Application
2. Dashboard highlights the increase in critical issues
3. Engineer navigates to Issues and filters by critical + open
4. Selects a violation and reviews details in the drawer
5. Marks issue as fixed
6. Issue remains until verified in the next scan

---

## 🖥️ Screens

### 📊 Dashboard

The decision surface for current accessibility risk.
![Dashboard View](/public/assets/screenshots/dashboard.png)

- surfaces highest-risk properties and surfaces critical unresolved issues.
- Directs teams on where to focus efforts next based on regression trends.

### Issues

Primary remediation workspace — where accessibility work actually happens.

- triage and prioritize issues by severity and status
- scan and act on high-impact violations
- drill into issue details and remediation guidance

The primary workspace for triaging violations at scale. AccessOps uses a macro-to-micro workflow to handle deep data.

**Triage Table (Macro View)**
![Issues Table](/public/assets/screenshots/issues-table.png)

- High-density UI for managing hundreds of violations across properties using TanStack Table.

**Remediation Drawer (Micro View)**
![Issue Detail Drawer](/public/assets/screenshots/issues-drawer.png)

- An explainability layer providing "Why it Matters," WCAG criteria, and specific code fixes for developers.

### 🔍 Scans

Audit history and progress tracking.
![Scans View](/public/assets/screenshots/scans.png)

- Provides a breakdown of findings for every individual audit.
- Tracks remediation velocity and confirms if fixes are "Verified" in later scans.

---

## ⚙️ Tech Stack & Architecture

- **Framework:** Next.js 15 (App Router & Turbopack)
- **Logic Separation:** Data is transformed into view-models (like `PropertyHealthSummary`) before rendering.
- **Theme Engine:** Custom dark mode implementation with a blocking script to prevent FOUC (Flash of Unstyled Content).

|                  Dark Mode (Desktop)                  |                      Mobile Dashboard                      |
| :---------------------------------------------------: | :--------------------------------------------------------: |
| ![Dark Mode](/public/assets/screenshots/darkmode.png) | ![Mobile View](/public/assets/screenshots/mobile-dash.png) |

---

## 🧱 Accessibility & Design

Accessibility is a first-class concern in AccessOps:

- **Semantic HTML:** Foundation of the component library.
- **Responsive Design:** Summary stats transition from a grid to a single-column stack on mobile.
- **Keyboard-first:** Full navigation and triage support via keyboard.

---

## 📊 Data Strategy

This project uses **seeded audit data** to simulate diverse real-world scenarios:

- **Improvement:** A marketing site showing a downward trend in issues.
- **Regression:** A loan application where new features introduced new bugs.
- **Neglected Backlog:** A support center with high-volume, low-priority debt.

---

## 🚀 Getting Started

1. **Install:** `npm install`
2. **Dev:** `npm run dev`
3. **Build:** `npm run build` (Checks types and generates production bundles)

---

## 💭 Why I Built This

Accessibility issues don’t fail because they aren’t detected —
they fail because they aren’t **prioritized, owned, and verified.**

This project explores what accessibility tooling looks like when it is built around **real workflows** instead of reports.
