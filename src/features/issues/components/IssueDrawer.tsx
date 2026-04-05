"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { HydratedViolation } from "@/lib/data/index";
import type { AggregatedIssue } from "../utils/aggregateIssues";
import type { IssueViewMode } from "./IssueFilterBar";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import FlatIssueDrawerContent from "./drawer/FlatIssueDrawerContent";
import GroupedIssueDrawerContent from "./drawer/GroupedIssueDrawerContent";

interface IssueDrawerProps {
  viewMode: IssueViewMode;
  violation: HydratedViolation | null;
  groupedIssue: AggregatedIssue | null;
  assignableUsers: User[];
  rulePageCount?: number;
  onClose: () => void;
  onFocusTrigger: () => boolean;
  onViewAllInstances: (ruleId: string) => void;
  onUpdateViolation: (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => void;
}

const IssueDrawer = ({
  viewMode,
  violation,
  groupedIssue,
  assignableUsers,
  rulePageCount,
  onClose,
  onFocusTrigger,
  onViewAllInstances,
  onUpdateViolation,
}: IssueDrawerProps) => {
  const groupedRuleMode = viewMode === "grouped-rule";
  const sampleViolation = groupedRuleMode
    ? (groupedIssue?.sampleInstance ?? null)
    : violation;
  const open = groupedRuleMode ? groupedIssue !== null : violation !== null;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        id="issue-details-drawer"
        side="right"
        className="flex flex-col gap-0 overflow-hidden p-0"
        onCloseAutoFocus={(e) => {
          const restoredFocus = onFocusTrigger();
          if (restoredFocus) {
            e.preventDefault();
          }
        }}
      >
        <SheetTitle className="sr-only">Issue details</SheetTitle>
        {groupedRuleMode && groupedIssue && sampleViolation && (
          <GroupedIssueDrawerContent
            groupedIssue={groupedIssue}
            sampleViolation={sampleViolation}
            onViewAllInstances={onViewAllInstances}
          />
        )}
        {!groupedRuleMode && violation && (
          <FlatIssueDrawerContent
            violation={violation}
            assignableUsers={assignableUsers}
            rulePageCount={rulePageCount}
            onViewAllInstances={onViewAllInstances}
            onUpdateViolation={onUpdateViolation}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default IssueDrawer;
