"use client";

import Link from "next/link";
import { LayoutDashboard, ScanLine, AlertTriangle, GitCompare } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scans", href: "/scans", icon: ScanLine },
  { label: "Issues", href: "/issues", icon: AlertTriangle },
  { label: "Compare", href: "/compare", icon: GitCompare },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b">
        <Link href="/dashboard" className="block">
          <span className="text-sm font-semibold text-foreground">AccessOps</span>
          <p className="text-xs text-muted-foreground mt-0.5">Veridian Financial</p>
        </Link>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <SidebarNavItem {...item} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t">
        <p className="text-sm font-medium text-foreground">Alex Rivera</p>
        <p className="text-xs text-muted-foreground mt-0.5">Accessibility Lead</p>
      </div>
    </div>
  );
}
