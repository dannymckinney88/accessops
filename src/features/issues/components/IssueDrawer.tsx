"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { HydratedViolation } from "@/lib/data/index";
import type { AggregatedIssue } from "../utils/aggregateIssues";
import type { IssueViewMode } from "./IssueFilterBar";
import type { RemediationStatus, User } from "@/lib/data/types/domain";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";

interface IssueDrawerProps {
  viewMode: IssueViewMode;
  violation: HydratedViolation | null;
  groupedIssue: AggregatedIssue | null;
  assignableUsers: User[];
  rulePageCount?: number;
  onClose: () => void;
  onFocusTrigger: () => void;
  onViewAllInstances: (ruleId: string) => void;
  onUpdateViolation: (
    id: string,
    patch: { assigneeId?: string | null; status?: RemediationStatus },
  ) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const inlineActionClass =
  "ml-3 inline-flex items-center rounded-sm px-1.5 py-1 text-xs font-medium text-foreground underline underline-offset-4 outline-none transition-colors hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

const externalLinkClass =
  "inline-flex items-center rounded-sm px-1.5 py-1 text-xs font-medium text-foreground underline underline-offset-4 outline-none transition-colors hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";
const drawerSelectClass =
  "h-8 rounded-md border border-input bg-background px-2 pr-7 text-sm text-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

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
          e.preventDefault();
          onFocusTrigger();
        }}
      >
        <SheetTitle className="sr-only">Issue details</SheetTitle>
        {groupedRuleMode && groupedIssue && sampleViolation && (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={groupedIssue.severity} />
                <StatusBadge status={groupedIssue.status} />
                <PriorityBadge priority={groupedIssue.priority} />
              </div>
              <h2 className="text-base leading-snug font-semibold text-foreground">
                {groupedIssue.rule?.help ?? groupedIssue.ruleId}
              </h2>
              <p className="text-sm text-muted-foreground">
                Affects {groupedIssue.affectedPagesCount}{" "}
                {groupedIssue.affectedPagesCount === 1 ? "page" : "pages"} ·{" "}
                {groupedIssue.totalInstances}{" "}
                {groupedIssue.totalInstances === 1 ? "instance" : "instances"}
              </p>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {groupedIssue.rule?.whyItMatters && (
                <section aria-labelledby="drawer-why-heading-grouped">
                  <h3
                    id="drawer-why-heading-grouped"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Why it matters
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {groupedIssue.rule.whyItMatters}
                  </p>
                </section>
              )}

              {groupedIssue.rule?.whoIsImpacted && (
                <section aria-labelledby="drawer-who-heading-grouped">
                  <h3
                    id="drawer-who-heading-grouped"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Who is impacted
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {groupedIssue.rule.whoIsImpacted}
                  </p>
                </section>
              )}

              <Separator />

              <section aria-labelledby="drawer-scope-heading-grouped">
                <h3
                  id="drawer-scope-heading-grouped"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Scope
                </h3>
                <dl className="flex flex-col gap-0 text-sm">
                  <dt className="text-xs text-muted-foreground">
                    Affected pages
                  </dt>
                  <dd className="mt-1">{groupedIssue.affectedPagesCount}</dd>

                  <dt className="mt-4 text-xs text-muted-foreground">
                    Affected properties
                  </dt>
                  <dd className="mt-1">
                    {groupedIssue.affectedPropertiesCount === 1
                      ? (groupedIssue.affectedProperties[0]?.name ??
                        "1 property")
                      : `${groupedIssue.affectedPropertiesCount} properties`}
                  </dd>

                  <dt className="mt-4 text-xs text-muted-foreground">
                    First seen
                  </dt>
                  <dd className="mt-1">
                    {formatDate(groupedIssue.firstSeenAt)}
                  </dd>

                  <dt className="mt-4 text-xs text-muted-foreground">
                    Last seen
                  </dt>
                  <dd className="mt-1">
                    {formatDate(groupedIssue.lastSeenAt)}
                  </dd>

                  <dt className="mt-4 text-xs text-muted-foreground">Pages</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1 text-sm text-foreground">
                      {groupedIssue.affectedPages.slice(0, 8).map((page) => (
                        <li key={page.id}>
                          {page.title}
                          <span className="text-muted-foreground">
                            {" "}
                            · {page.path}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {groupedIssue.affectedPages.length > 8 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        +{groupedIssue.affectedPages.length - 8} more pages
                      </p>
                    )}
                  </dd>

                  <dt className="mt-4 text-xs text-muted-foreground">
                    Instances
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    This grouped issue combines {groupedIssue.totalInstances}{" "}
                    raw issue instances.
                    <button
                      type="button"
                      onClick={() => onViewAllInstances(groupedIssue.ruleId)}
                      className={inlineActionClass}
                    >
                      View all instances
                    </button>
                  </dd>
                </dl>
              </section>

              <Separator />

              <section aria-labelledby="drawer-sample-heading-grouped">
                <h3
                  id="drawer-sample-heading-grouped"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Example instance
                </h3>
                <dl className="flex flex-col gap-0 text-sm">
                  <dt className="text-xs text-muted-foreground">
                    Failing element
                  </dt>
                  <dd className="mt-1">
                    <div
                      role="region"
                      aria-label="Example failing HTML element"
                    >
                      <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                        {sampleViolation.html}
                      </code>
                    </div>
                  </dd>

                  {sampleViolation.target.length > 0 && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Selector
                      </dt>
                      <dd className="mt-1">
                        <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                          {sampleViolation.target.join(" > ")}
                        </code>
                      </dd>
                    </>
                  )}

                  {sampleViolation.failureSummary && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Failure summary
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {sampleViolation.failureSummary}
                      </dd>
                    </>
                  )}
                </dl>
              </section>

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
        )}

        {!groupedRuleMode && violation && (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={violation.impact} />
                <StatusBadge status={violation.status} />
                <PriorityBadge priority={violation.priority} />
              </div>
              <h2 className="text-base leading-snug font-semibold text-foreground">
                {violation.rule?.help ?? violation.ruleId}
              </h2>
              <p className="text-sm text-muted-foreground">
                {violation.property?.name}
                {violation.page ? ` · ${violation.page.title}` : ""}
              </p>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <section aria-labelledby="drawer-actions-heading">
                <h3
                  id="drawer-actions-heading"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="drawer-assignee"
                      className="text-xs text-muted-foreground"
                    >
                      Assignee
                    </label>
                    <select
                      id="drawer-assignee"
                      value={violation.assigneeId ?? ""}
                      onChange={(e) =>
                        onUpdateViolation(violation.id, {
                          assigneeId: e.target.value || null,
                        })
                      }
                      className={drawerSelectClass}
                    >
                      <option value="">Unassigned</option>
                      {violation.assignee && !violation.assignee.isActive && (
                        <option value={violation.assignee.id} disabled>
                          {violation.assignee.name} (inactive)
                        </option>
                      )}
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {violation.status === "verified" ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <div className="flex items-center gap-2 py-1">
                        <StatusBadge status="verified" />
                        <span className="text-xs text-muted-foreground">
                          Set by audit
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="drawer-status"
                        className="text-xs text-muted-foreground"
                      >
                        Status
                      </label>
                      <select
                        id="drawer-status"
                        value={violation.status}
                        onChange={(e) =>
                          onUpdateViolation(violation.id, {
                            status: e.target.value as RemediationStatus,
                          })
                        }
                        className={drawerSelectClass}
                      >
                        {(
                          [
                            "open",
                            "in-progress",
                            "fixed",
                            "accepted-risk",
                          ] as RemediationStatus[]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {s === "open"
                              ? "Open"
                              : s === "in-progress"
                                ? "In Progress"
                                : s === "fixed"
                                  ? "Fixed"
                                  : "Accepted Risk"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {violation.rule?.whyItMatters && (
                <section aria-labelledby="drawer-why-heading-flat">
                  <h3
                    id="drawer-why-heading-flat"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Why it matters
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.whyItMatters}
                  </p>
                </section>
              )}

              {violation.rule?.whoIsImpacted && (
                <section aria-labelledby="drawer-who-heading-flat">
                  <h3
                    id="drawer-who-heading-flat"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Who is impacted
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.whoIsImpacted}
                  </p>
                </section>
              )}

              <Separator />

              <section aria-labelledby="drawer-what-failed-heading-flat">
                <h3
                  id="drawer-what-failed-heading-flat"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  What failed
                </h3>
                <dl className="flex flex-col gap-0 text-sm">
                  <dt className="text-xs text-muted-foreground">
                    Failing element
                  </dt>
                  <dd className="mt-1">
                    <div role="region" aria-label="Failing HTML element">
                      <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                        {violation.html}
                      </code>
                    </div>
                  </dd>

                  {violation.target.length > 0 && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Selector
                      </dt>
                      <dd className="mt-1">
                        <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                          {violation.target.join(" > ")}
                        </code>
                      </dd>
                    </>
                  )}

                  {violation.failureSummary && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Failure summary
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {violation.failureSummary}
                      </dd>
                    </>
                  )}

                  <dt className="mt-4 text-xs text-muted-foreground">
                    First seen
                  </dt>
                  <dd className="mt-1">{formatDate(violation.firstSeenAt)}</dd>

                  <dt className="mt-4 text-xs text-muted-foreground">
                    Last seen
                  </dt>
                  <dd className="mt-1">{formatDate(violation.lastSeenAt)}</dd>

                  {violation.page && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Page
                      </dt>
                      <dd className="mt-1">
                        {violation.page.title}
                        <span className="text-muted-foreground">
                          {" "}
                          · {violation.page.path}
                        </span>
                      </dd>
                    </>
                  )}

                  {rulePageCount !== undefined && rulePageCount > 1 && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">
                        Scope
                      </dt>
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
                </dl>
              </section>

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
        )}
      </SheetContent>
    </Sheet>
  );
};

export default IssueDrawer;
