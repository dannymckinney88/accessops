interface IssueDrawerExplainabilitySectionProps {
  whyItMatters?: string;
  whoIsImpacted?: string;
  idPrefix: string;
}

const IssueDrawerExplainabilitySection = ({
  whyItMatters,
  whoIsImpacted,
  idPrefix,
}: IssueDrawerExplainabilitySectionProps) => (
  <>
    {whyItMatters && (
      <section aria-labelledby={`drawer-why-heading-${idPrefix}`}>
        <h3
          id={`drawer-why-heading-${idPrefix}`}
          className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Why it matters
        </h3>
        <p className="text-sm leading-relaxed text-foreground">{whyItMatters}</p>
      </section>
    )}

    {whoIsImpacted && (
      <section aria-labelledby={`drawer-who-heading-${idPrefix}`}>
        <h3
          id={`drawer-who-heading-${idPrefix}`}
          className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Who is impacted
        </h3>
        <p className="text-sm leading-relaxed text-foreground">{whoIsImpacted}</p>
      </section>
    )}
  </>
);

export default IssueDrawerExplainabilitySection;
