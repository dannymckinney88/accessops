import { SheetHeader } from "@/components/ui/sheet";
import type { ReactNode } from "react";

interface IssueDrawerHeaderProps {
  badges: ReactNode;
  title: string;
  subtitle: string;
}

const IssueDrawerHeader = ({ badges, title, subtitle }: IssueDrawerHeaderProps) => (
  <SheetHeader className="border-b px-6 py-5">
    <div className="mb-3 flex flex-wrap items-center gap-2">{badges}</div>
    <h2 className="text-base leading-snug font-semibold text-foreground">{title}</h2>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </SheetHeader>
);

export default IssueDrawerHeader;
