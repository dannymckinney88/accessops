import type { Page } from "@/lib/data/types/domain";

export const pages: Page[] = [
  // ─── Marketing Site ────────────────────────────────────────────────────────
  {
    id: "page-mkt-home",
    propertyId: "prop-marketing",
    path: "/",
    title: "Home",
  },
  {
    id: "page-mkt-personal",
    propertyId: "prop-marketing",
    path: "/personal",
    title: "Personal Banking",
  },
  {
    id: "page-mkt-business",
    propertyId: "prop-marketing",
    path: "/business",
    title: "Business Banking",
  },
  {
    id: "page-mkt-loans",
    propertyId: "prop-marketing",
    path: "/loans",
    title: "Loans & Credit",
  },
  {
    id: "page-mkt-rates",
    propertyId: "prop-marketing",
    path: "/rates",
    title: "Rates & Fees",
  },
  {
    id: "page-mkt-about",
    propertyId: "prop-marketing",
    path: "/about",
    title: "About Us",
  },
  {
    id: "page-mkt-contact",
    propertyId: "prop-marketing",
    path: "/contact",
    title: "Contact",
  },
  {
    id: "page-mkt-careers",
    propertyId: "prop-marketing",
    path: "/careers",
    title: "Careers",
  },

  // ─── Loan Application ──────────────────────────────────────────────────────
  {
    id: "page-loan-start",
    propertyId: "prop-loan-app",
    path: "/apply",
    title: "Start Application",
  },
  {
    id: "page-loan-personal",
    propertyId: "prop-loan-app",
    path: "/apply/personal-info",
    title: "Personal Information",
  },
  {
    id: "page-loan-employment",
    propertyId: "prop-loan-app",
    path: "/apply/employment",
    title: "Employment & Income",
  },
  {
    id: "page-loan-assets",
    propertyId: "prop-loan-app",
    path: "/apply/assets",
    title: "Assets & Liabilities",
  },
  {
    id: "page-loan-housing",
    propertyId: "prop-loan-app",
    path: "/apply/housing",
    title: "Housing Information",
  },
  {
    id: "page-loan-review",
    propertyId: "prop-loan-app",
    path: "/apply/review",
    title: "Review Application",
  },
  {
    id: "page-loan-documents",
    propertyId: "prop-loan-app",
    path: "/apply/documents",
    title: "Document Upload",
  },
  {
    id: "page-loan-confirm",
    propertyId: "prop-loan-app",
    path: "/apply/confirmation",
    title: "Confirmation",
  },

  // ─── Customer Dashboard ────────────────────────────────────────────────────
  {
    id: "page-app-overview",
    propertyId: "prop-dashboard",
    path: "/overview",
    title: "Account Overview",
  },
  {
    id: "page-app-accounts",
    propertyId: "prop-dashboard",
    path: "/accounts",
    title: "Accounts",
  },
  {
    id: "page-app-txn",
    propertyId: "prop-dashboard",
    path: "/accounts/transactions",
    title: "Transaction History",
  },
  {
    id: "page-app-transfer",
    propertyId: "prop-dashboard",
    path: "/transfer",
    title: "Transfer Funds",
  },
  {
    id: "page-app-payments",
    propertyId: "prop-dashboard",
    path: "/payments",
    title: "Bill Pay",
  },
  {
    id: "page-app-profile",
    propertyId: "prop-dashboard",
    path: "/profile",
    title: "Profile & Settings",
  },
  {
    id: "page-app-statements",
    propertyId: "prop-dashboard",
    path: "/statements",
    title: "Statements & Documents",
  },

  // ─── Support Center ────────────────────────────────────────────────────────
  {
    id: "page-sup-home",
    propertyId: "prop-support",
    path: "/",
    title: "Support Home",
  },
  {
    id: "page-sup-accounts",
    propertyId: "prop-support",
    path: "/accounts",
    title: "Account Help",
  },
  {
    id: "page-sup-loans",
    propertyId: "prop-support",
    path: "/loans",
    title: "Loan Help",
  },
  {
    id: "page-sup-security",
    propertyId: "prop-support",
    path: "/security",
    title: "Security & Fraud",
  },
  {
    id: "page-sup-contact",
    propertyId: "prop-support",
    path: "/contact",
    title: "Contact Support",
  },
];
