export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border bg-background p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">AccessOps</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Accessibility operations dashboard
          </h1>
          <p className="text-base text-muted-foreground">
            Internal workflow for monitoring scan health, triaging violations,
            tracking remediation, and comparing results over time.
          </p>
        </div>
      </div>
    </main>
  );
}
