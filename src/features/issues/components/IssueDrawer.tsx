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
  onFocusTrigger: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const IssueDrawer = ({ violation, onClose, onFocusTrigger }: IssueDrawerProps) => {
  return (
    <Sheet
      open={violation !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 overflow-hidden"
        onCloseAutoFocus={(e) => {
          // Prevent Radix returning focus to the document body.
          // We restore focus manually to the row that triggered the drawer.
          e.preventDefault();
          onFocusTrigger();
        }}
      >
        {violation && (
          <>
            {/* SheetTitle renders as <h2>; section headings inside use <h3>. */}
            <SheetHeader className="px-6 py-5 border-b">
              <div className="flex items-center gap-2 flex-wrap mb-3">
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
              {violation.rule?.whyItMatters && (
                <section aria-labelledby="drawer-why-heading">
                  <h3
                    id="drawer-why-heading"
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
                <section aria-labelledby="drawer-who-heading">
                  <h3
                    id="drawer-who-heading"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Who is impacted
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.whoIsImpacted}
                  </p>
                </section>
              )}

              {violation.rule?.howToFix && (
                <section aria-labelledby="drawer-fix-heading">
                  <h3
                    id="drawer-fix-heading"
                    className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    How to fix it
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {violation.rule.howToFix}
                  </p>
                </section>
              )}

              <Separator />

              <section aria-labelledby="drawer-what-failed-heading">
                <h3
                  id="drawer-what-failed-heading"
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  What failed
                </h3>
                {/* dl must only contain dt/dd as direct children — no div wrappers.
                    gap-0 + mt-1 on dd (tight) and mt-4 on non-first dt (loose between pairs). */}
                <dl className="flex flex-col gap-0 text-sm">
                  <dt className="text-xs text-muted-foreground">Failing element</dt>
                  <dd className="mt-1">
                    {/* role="region" scopes this code block for AT users per spec */}
                    <div role="region" aria-label="Failing HTML element">
                      <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                        {violation.html}
                      </code>
                    </div>
                  </dd>

                  {violation.target.length > 0 && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">Selector</dt>
                      <dd className="mt-1">
                        <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground">
                          {violation.target.join(" > ")}
                        </code>
                      </dd>
                    </>
                  )}

                  {violation.failureSummary && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">Failure summary</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {violation.failureSummary}
                      </dd>
                    </>
                  )}

                  <dt className="mt-4 text-xs text-muted-foreground">First seen</dt>
                  <dd className="mt-1">{formatDate(violation.firstSeenAt)}</dd>

                  <dt className="mt-4 text-xs text-muted-foreground">Last seen</dt>
                  <dd className="mt-1">{formatDate(violation.lastSeenAt)}</dd>

                  {violation.page && (
                    <>
                      <dt className="mt-4 text-xs text-muted-foreground">Page</dt>
                      <dd className="mt-1">
                        {violation.page.title}
                        <span className="text-muted-foreground">
                          {" "}
                          · {violation.page.path}
                        </span>
                      </dd>
                    </>
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
                    className="rounded-sm text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
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
