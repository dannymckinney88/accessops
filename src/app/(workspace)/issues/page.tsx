import { Suspense } from "react";
import { getHydratedViolations, getProperties, getCurrentUser, getUsers } from "@/lib/data/index";
import IssuesClient from "@/features/issues/components/IssuesClient";

export default async function IssuesPage() {
  const [violations, properties, currentUser, users] = await Promise.all([
    getHydratedViolations(),
    getProperties(),
    getCurrentUser(),
    getUsers(),
  ]);

  // Suspense is required because IssuesClient uses useSearchParams.
  // Next.js App Router requires a Suspense boundary around any Client Component
  // that reads search params. The fallback is shown during client hydration only.
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div>
            <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
            <div className="mt-1 h-4 w-56 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
          <div className="rounded-lg border overflow-hidden">
            <div className="h-10 bg-muted/50 border-b" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 border-b last:border-0 bg-background animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <IssuesClient violations={violations} properties={properties} currentUser={currentUser} users={users} />
    </Suspense>
  );
}
