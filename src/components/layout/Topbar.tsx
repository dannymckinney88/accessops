"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between px-6 border-b bg-background">
      <div className="flex items-center">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
          aria-expanded={mobileNavOpen}
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="hidden md:block text-sm font-medium text-foreground">
          AccessOps
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>

      <MobileSidebar
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </header>
  );
}
