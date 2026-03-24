"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

export default function SidebarNavItem({ label, href, icon: Icon }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150",
      ].join(" ")}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}
