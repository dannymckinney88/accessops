import { Separator } from "@/components/ui/separator";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import type { HydratedViolation } from "@/lib/data/index";
import type { AggregatedIssue } from "../../utils/aggregateIssues";
import IssueDrawerHeader from "./IssueDrawerHeader";
import IssueDrawerExplainabilitySection from "./IssueDrawerExplainabilitySection";
import IssueDrawerScopeSection from "./IssueDrawerScopeSection";
import IssueDrawerFailureSection from "./IssueDrawerFailureSection";

interface GroupedIssueDrawerContentProps {
  groupedIssue: AggregatedIssue;
  sampleViolation: HydratedViolation;
  onViewAllInstances: (ruleId: string) => void;
}

const GroupedIssueDrawerContent = ({
  groupedIssue,
  sampleViolation,
  onViewAllInstances,
}: GroupedIssueDrawerContentProps) => (
  <>
    <IssueDrawerHeader
      badges={
        <>
          <SeverityBadge severity={groupedIssue.severity} />
          <StatusBadge status={groupedIssue.status} />
          <PriorityBadge priority={groupedIssue.priority} />
        </>
      }
      title={groupedIssue.rule?.help ?? groupedIssue.ruleId}
      subtitle={`Affects ${groupedIssue.affectedPagesCount} ${groupedIssue.affectedPagesCount === 1 ? "page" : "pages"} · ${groupedIssue.totalInstances} ${groupedIssue.totalInstances === 1 ? "instance" : "instances"}`}
    />

    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
      <IssueDrawerExplainabilitySection
        whyItMatters={groupedIssue.rule?.whyItMatters}
        whoIsImpacted={groupedIssue.rule?.whoIsImpacted}
        idPrefix="grouped"
      />

      <Separator />

      <IssueDrawerScopeSection
        groupedIssue={groupedIssue}
        onViewAllInstances={onViewAllInstances}
      />

      <Separator />

      <IssueDrawerFailureSection
        heading="Example instance"
        headingId="drawer-sample-heading-grouped"
        failingElementLabel="Example failing HTML element"
        html={sampleViolation.html}
        target={sampleViolation.target}
        failureSummary={sampleViolation.failureSummary}
      />

      {groupedIssue.rule?.howToFix && (
        <section aria-labelledby="drawer-fix-heading-grouped">
          <h3
            id="drawer-fix-heading-grouped"
            className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            How to fix it
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            {groupedIssue.rule.howToFix}
          </p>
        </section>
      )}
    </div>
  </>
);

export default GroupedIssueDrawerContent;
