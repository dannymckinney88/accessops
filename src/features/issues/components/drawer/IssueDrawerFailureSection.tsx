import type { ReactNode } from "react";

interface IssueDrawerFailureSectionProps {
  heading: string;
  headingId: string;
  failingElementLabel: string;
  html: string;
  target: string[];
  failureSummary?: string | null;
  children?: ReactNode;
}

// Renders the failing element block (html, selector, failure summary).
// Accepts optional children for mode-specific dl rows appended after the shared fields.
const IssueDrawerFailureSection = ({
  heading,
  headingId,
  failingElementLabel,
  html,
  target,
  failureSummary,
  children,
}: IssueDrawerFailureSectionProps) => (
  <section aria-labelledby={headingId}>
    <h3
      id={headingId}
      className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    >
      {heading}
    </h3>
    <dl className="flex flex-col gap-0 text-sm">
      <dt className="text-xs text-muted-foreground">Failing element</dt>
      <dd className="mt-1">
        <div role="region" aria-label={failingElementLabel}>
          <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
            {html}
          </code>
        </div>
      </dd>

      {target.length > 0 && (
        <>
          <dt className="mt-4 text-xs text-muted-foreground">Selector</dt>
          <dd className="mt-1">
            <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
              {target.join(" > ")}
            </code>
          </dd>
        </>
      )}

      {failureSummary && (
        <>
          <dt className="mt-4 text-xs text-muted-foreground">Failure summary</dt>
          <dd className="mt-1 text-sm text-foreground">{failureSummary}</dd>
        </>
      )}

      {children}
    </dl>
  </section>
);

export default IssueDrawerFailureSection;
