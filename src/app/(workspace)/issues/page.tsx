import { Suspense } from "react";
import { getHydratedViolations, getProperties } from "@/lib/data/index";
import IssuesClient from "@/features/issues/components/IssuesClient";

export default async function IssuesPage() {
  const [violations, properties] = await Promise.all([
    getHydratedViolations(),
    getProperties(),
  ]);

  // Suspense is required here because IssuesClient uses useSearchParams.
  // Next.js App Router mandates a Suspense boundary around any Client Component
  // that reads search params.
  return (
    <Suspense>
      <IssuesClient violations={violations} properties={properties} />
    </Suspense>
  );
}
