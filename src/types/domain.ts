export type Severity = "minor" | "moderate" | "serious" | "critical";

export type ScanStatus = "queued" | "running" | "completed" | "failed";

export type RemediationStatus =
  | "open"
  | "in-progress"
  | "resolved"
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

export interface ScanPage {
  id: string;
  scanRunId: string;
  pageId: string;
  violationCount: number;
  passCount: number;
  incompleteCount: number;
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
  resolvedAt?: string;
}
