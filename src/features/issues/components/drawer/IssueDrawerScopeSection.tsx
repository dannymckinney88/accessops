"use client";

import type { AggregatedIssue } from "../../utils/aggregateIssues";
import { formatDate, inlineActionClass } from "./drawerStyles";

interface IssueDrawerScopeSectionProps {
  groupedIssue: AggregatedIssue;
  onViewAllInstances: (ruleId: string) => void;
}

const IssueDrawerScopeSection = ({
  groupedIssue,
  onViewAllInstances,
}: IssueDrawerScopeSectionProps) => (
  <section aria-labelledby="drawer-scope-heading-grouped">
    <h3
      id="drawer-scope-heading-grouped"
      className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    >
      Scope
    </h3>
    <dl className="flex flex-col gap-0 text-sm">
      <dt className="text-xs text-muted-foreground">Affected pages</dt>
      <dd className="mt-1">{groupedIssue.affectedPagesCount}</dd>

      <dt className="mt-4 text-xs text-muted-foreground">Affected properties</dt>
      <dd className="mt-1">
        {groupedIssue.affectedPropertiesCount === 1
          ? (groupedIssue.affectedProperties[0]?.name ?? "1 property")
          : `${groupedIssue.affectedPropertiesCount} properties`}
      </dd>

      <dt className="mt-4 text-xs text-muted-foreground">First seen</dt>
      <dd className="mt-1">{formatDate(groupedIssue.firstSeenAt)}</dd>

      <dt className="mt-4 text-xs text-muted-foreground">Last seen</dt>
      <dd className="mt-1">{formatDate(groupedIssue.lastSeenAt)}</dd>

      <dt className="mt-4 text-xs text-muted-foreground">Pages</dt>
      <dd className="mt-1">
        <ul className="space-y-1 text-sm text-foreground">
          {groupedIssue.affectedPages.slice(0, 8).map((page) => (
            <li key={page.id}>
              {page.title}
              <span className="text-muted-foreground"> · {page.path}</span>
            </li>
          ))}
        </ul>
        {groupedIssue.affectedPages.length > 8 && (
          <p className="mt-2 text-xs text-muted-foreground">
            +{groupedIssue.affectedPages.length - 8} more pages
          </p>
        )}
      </dd>

      <dt className="mt-4 text-xs text-muted-foreground">Instances</dt>
      <dd className="mt-1 text-sm text-foreground">
        This grouped issue combines {groupedIssue.totalInstances} raw issue instances.
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
);

export default IssueDrawerScopeSection;
