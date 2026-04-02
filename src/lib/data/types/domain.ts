export type Severity = "minor" | "moderate" | "serious" | "critical";

export type ScanStatus = "queued" | "running" | "completed" | "failed";

export type RemediationStatus =
  | "open"
  | "in-progress"
  | "fixed"
  | "verified"
  | "accepted-risk";

export type Priority = "low" | "medium" | "high" | "urgent";

export type RuleCategory =
  | "color"
  | "forms"
  | "keyboard"
  | "images"
  | "structure"
  | "aria"
  | "links"
  | "landmarks"
  | "names-and-labels"
  | "tables";

export interface Property {
  id: string;
  name: string;
  baseUrl: string;
  owner: string;
  createdAt: string;
}

export interface Page {
  id: string;
  propertyId: string;
  path: string;
  title: string;
}

export interface ScanRun {
  id: string;
  propertyId: string;
  initiatedAt: string;
  completedAt: string;
  status: ScanStatus;
  pageCount: number;
  triggeredBy: string;
}

// src/lib/data/types/domain.ts
// src/lib/data/types/domain.ts

export interface ScanPage {
  id: string;
  scanRunId: string; // Link to the ScanRun
  pageId: string; // Link to the Page metadata
  totalIssues: number; // Count of all issues found on this page
  resolvedIssues: number; // Count of fixed/verified issues
  remainingIssues: number; // Count of open/in-progress issues
  criticalRemaining: number; // Count of high-priority issues
}

export interface Rule {
  id: string;
  ruleId: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  wcagCriteria: string[];
  category: RuleCategory;
  defaultImpact: Severity;
  // Explainability layer — authored content for the issue drawer
  whyItMatters?: string;
  whoIsImpacted?: string;
  howToFix?: string;
}

export interface ViolationInstance {
  id: string;
  scanRunId: string;
  scanPageId: string;
  ruleId: string;
  impact: Severity;
  html: string;
  target: string[];
  failureSummary?: string;
  context?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: RemediationStatus;
  priority: Priority;
  notes?: string;
  assignedTo?: string;
  // verifiedAt: set when a later audit confirms the issue is no longer present.
  verifiedAt?: string;
}

// --- Dashboard Specific Types ---

export type PropertyHealthSummary = {
  property: Property;
  latestScanRun: ScanRun | null;
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  unfixedCount: number;
  trend:
    | "high-risk"
    | "active-remediation"
    | "healthy"
    | "stagnant"
    | "insufficient-data";
};

export type SeverityDistributionPoint = {
  severity: "Critical" | "Serious" | "Moderate" | "Minor";
  count: number;
};

export type DashboardCurrentState = {
  totalViolations: number;
  criticalCount: number;
  highSeverityCount: number;
  propertyCount: number;
  propertiesWithIssues: number;
  propertiesWithCritical: number;
  regressingCount: number;
  unfixedCount: number;
  openCount: number;
  inProgressCount: number;
  fixedCount: number;
  verifiedCount: number;
  acceptedRiskCount: number;
  severityDistribution: SeverityDistributionPoint[];
  propertyHealthSummaries: PropertyHealthSummary[];
  topCriticalRule: {
    ruleId: string;
    help: string;
    count: number;
    propertyCount: number;
    topPropertyName: string;
    pageCount: number;
  } | null;
  topCriticalPages: Array<{
    pageId: string;
    pageTitle: string;
    pagePath: string;
    propertyName: string;
    criticalCount: number;
  }>;
  severityByProperty: Array<{
    propertyId: string;
    propertyName: string;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  }>;
};

export type DashboardSummary = DashboardCurrentState;

// --- Scans Screen Specific Types ---

export type ScanType = "Previous audit" | "Current audit";

export type ScanPageRowData = {
  page: Page;
  totalIssues: number;
  remainingIssues: number;
  resolvedIssues: number;
  criticalRemaining: number;
};

export type ScanRowData = {
  scanRun: ScanRun;
  property: Property;
  scanType: ScanType;
  pages: ScanPageRowData[];
  totalIssues: number;
  remainingIssues: number;
  resolvedIssues: number;
  severitySummary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  isHighRisk: boolean;
};

export type PropertyHealthItem = {
  property: Property;
  trend: "improving" | "regressing" | "stable" | "insufficient-data";
  remainingIssues: number;
  criticalRemaining: number;
};

export type ScansScreenData = {
  scanRows: ScanRowData[];
  propertyHealthItems: PropertyHealthItem[];
  alertSummary: string | null;
};

export type HistoricalScanSummary = {
  scanRunId: string;
  totalIssues: number;
  resolvedIssues: number;
  remainingIssues: number;
  criticalRemaining: number;
  severitySummary?: Partial<Record<Severity, number>>;
};
