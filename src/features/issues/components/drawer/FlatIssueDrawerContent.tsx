"use client";

import { Separator } from "@/components/ui/separator";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import type { HydratedViolation } from "@/lib/data/index";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import IssueDrawerHeader from "./IssueDrawerHeader";
import IssueDrawerAssignmentSection from "./IssueDrawerAssignmentSection";
import IssueDrawerExplainabilitySection from "./IssueDrawerExplainabilitySection";
import IssueDrawerFailureSection from "./IssueDrawerFailureSection";
import { externalLinkClass, formatDate } from "./drawerStyles";

interface FlatIssueDrawerContentProps {
  violation: HydratedViolation;
  assignableUsers: User[];
  rulePageCount?: number;
  onViewAllInstances: (ruleId: string) => void;
  onUpdateViolation: (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => void;
}

const FlatIssueDrawerContent = ({
  violation,
  assignableUsers,
  rulePageCount,
  onViewAllInstances,
  onUpdateViolation,
}: FlatIssueDrawerContentProps) => (
  <>
    <IssueDrawerHeader
      badges={
        <>
          <SeverityBadge severity={violation.impact} />
          <StatusBadge status={violation.status} />
          <PriorityBadge priority={violation.priority} />
        </>
      }
      title={violation.rule?.help ?? violation.ruleId}
      subtitle={`${violation.property?.name ?? ""}${violation.page ? ` · ${violation.page.title}` : ""}`}
    />

    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
      <IssueDrawerAssignmentSection
        violation={violation}
        assignableUsers={assignableUsers}
        onUpdateViolation={onUpdateViolation}
      />

      <Separator />

      <IssueDrawerExplainabilitySection
        whyItMatters={violation.rule?.whyItMatters}
        whoIsImpacted={violation.rule?.whoIsImpacted}
        idPrefix="flat"
      />

      <Separator />

      <IssueDrawerFailureSection
        heading="What failed"
        headingId="drawer-what-failed-heading-flat"
        failingElementLabel="Failing HTML element"
        html={violation.html}
        target={violation.target}
        failureSummary={violation.failureSummary}
      >
        <dt className="mt-4 text-xs text-muted-foreground">First seen</dt>
        <dd className="mt-1">{formatDate(violation.firstSeenAt)}</dd>

        <dt className="mt-4 text-xs text-muted-foreground">Last seen</dt>
        <dd className="mt-1">{formatDate(violation.lastSeenAt)}</dd>

        {violation.page && (
          <>
            <dt className="mt-4 text-xs text-muted-foreground">Page</dt>
            <dd className="mt-1">
              {violation.page.title}
              <span className="text-muted-foreground"> · {violation.page.path}</span>
            </dd>
          </>
        )}

        {rulePageCount !== undefined && rulePageCount > 1 && (
          <>
            <dt className="mt-4 text-xs text-muted-foreground">Scope</dt>
            <dd className="mt-1 text-sm text-foreground">
              This rule has violations on {rulePageCount} pages
              <button
                type="button"
                onClick={() => onViewAllInstances(violation.ruleId)}
                className="ml-3 rounded-sm text-xs text-primary underline underline-offset-4 outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View all instances
              </button>
            </dd>
          </>
        )}
      </IssueDrawerFailureSection>

      {violation.rule?.howToFix && (
        <section aria-labelledby="drawer-fix-heading-flat">
          <h3
            id="drawer-fix-heading-flat"
            className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            How to fix it
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            {violation.rule.howToFix}
          </p>
        </section>
      )}

      {violation.rule?.helpUrl && (
        <>
          <Separator />
          <a
            href={violation.rule.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClass}
          >
            View full guidance on Deque University
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </>
      )}
    </div>
  </>
);

export default FlatIssueDrawerContent;
