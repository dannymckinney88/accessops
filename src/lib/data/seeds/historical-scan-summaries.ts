import { HistoricalScanSummary } from "../types/domain";

export const historicalScanSummaries: HistoricalScanSummary[] = [
  {
    scanRunId: "sr-mkt-baseline",
    totalIssues: 132,
    resolvedIssues: 132,
    remainingIssues: 0,
    criticalRemaining: 0,
    severitySummary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
  },
  {
    scanRunId: "sr-loan-baseline",
    totalIssues: 58,
    resolvedIssues: 44,
    remainingIssues: 14,
    criticalRemaining: 4,
    severitySummary: {
      critical: 4,
      serious: 8,
      moderate: 2,
      minor: 0,
    },
  },
  {
    scanRunId: "sr-dash-baseline",
    totalIssues: 145,
    resolvedIssues: 108,
    remainingIssues: 37,
    criticalRemaining: 10,
    severitySummary: {
      critical: 10,
      serious: 19,
      moderate: 8,
      minor: 0,
    },
  },
  {
    scanRunId: "sr-sup-baseline",
    totalIssues: 75,
    resolvedIssues: 49,
    remainingIssues: 26,
    criticalRemaining: 7,
    severitySummary: {
      critical: 7,
      serious: 14,
      moderate: 5,
      minor: 0,
    },
  },
];
