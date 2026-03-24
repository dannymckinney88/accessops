import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 border-r flex-col">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main id="main-content" className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
