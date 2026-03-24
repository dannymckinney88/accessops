"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { HydratedViolation } from "@/lib/data/index";
import SeverityBadge from "@/components/common/SeverityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";

interface IssueDrawerProps {
  violation: HydratedViolation | null;
  onClose: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const IssueDrawer = ({ violation, onClose }: IssueDrawerProps) => {
  return (
    <Sheet
      open={violation !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="flex flex-col gap-0 p-0 overflow-hidden">
        {violation && (
          <>
            <SheetHeader className="px-6 py-5 border-b">
              <div className="flex items-center gap-2 mb-3">
                <SeverityBadge severity={violation.impact} />
                <StatusBadge status={violation.status} />
                <PriorityBadge priority={violation.priority} />
              </div>
              <SheetTitle className="text-base leading-snug">
                {violation.rule?.help ?? violation.ruleId}
              </SheetTitle>
              <SheetDescription>
                {violation.property?.name}
                {violation.page ? ` · ${violation.page.title}` : ""}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">
              {/* Explainability — required per CLAUDE.md */}
              {violation.rule?.whyItMatters && (
                <section aria-labelledby="drawer-why-heading">
                  <h2
                    id="drawer-why-heading"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Why it matters
                  </h2>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.whyItMatters}
                  </p>
                </section>
              )}

              {violation.rule?.whoIsImpacted && (
                <section aria-labelledby="drawer-who-heading">
                  <h2
                    id="drawer-who-heading"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Who is impacted
                  </h2>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.whoIsImpacted}
                  </p>
                </section>
              )}

              {violation.rule?.howToFix && (
                <section aria-labelledby="drawer-fix-heading">
                  <h2
                    id="drawer-fix-heading"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    What to do
                  </h2>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.howToFix}
                  </p>
                </section>
              )}

              <Separator />

              {/* Occurrence detail */}
              <section aria-labelledby="drawer-occurrence-heading">
                <h2
                  id="drawer-occurrence-heading"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Occurrence
                </h2>
                <dl className="flex flex-col gap-3 text-sm">
                  <div>
                    <dt className="mb-1 text-xs text-muted-foreground">
                      Failing element
                    </dt>
                    <dd>
                      <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                        {violation.html}
                      </code>
                    </dd>
                  </div>

                  {violation.target.length > 0 && (
                    <div>
                      <dt className="mb-1 text-xs text-muted-foreground">
                        Selector
                      </dt>
                      <dd>
                        <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                          {violation.target.join(" > ")}
                        </code>
                      </dd>
                    </div>
                  )}

                  {violation.failureSummary && (
                    <div>
                      <dt className="mb-1 text-xs text-muted-foreground">
                        Failure summary
                      </dt>
                      <dd className="text-sm text-foreground">
                        {violation.failureSummary}
                      </dd>
                    </div>
                  )}

                  <div className="flex gap-6">
                    <div>
                      <dt className="text-xs text-muted-foreground">First seen</dt>
                      <dd>{formatDate(violation.firstSeenAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Last seen</dt>
                      <dd>{formatDate(violation.lastSeenAt)}</dd>
                    </div>
                  </div>

                  {violation.page && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Page</dt>
                      <dd>
                        {violation.page.title}
                        <span className="text-muted-foreground">
                          {" "}
                          · {violation.page.path}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {violation.rule?.helpUrl && (
                <>
                  <Separator />
                  <a
                    href={violation.rule.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    View rule documentation →
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
