"use client";

import Link from "next/link";
import { LayoutDashboard, ScanLine, AlertTriangle } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Issues", href: "/issues", icon: AlertTriangle },
  { label: "Scans", href: "/scans", icon: ScanLine },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="block" onClick={onClose}>
          <span className="text-sm font-semibold text-sidebar-accent-foreground">
            AccessOps
          </span>
          <p className="text-xs text-sidebar-foreground mt-0.5">
            Veridian Financial
          </p>
        </Link>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <SidebarNavItem {...item} onClose={onClose} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-sm font-medium text-sidebar-accent-foreground">
          Alex Rivera
        </p>
        <p className="text-xs text-sidebar-foreground mt-0.5">
          Accessibility Lead
        </p>
      </div>
    </div>
  );
}
