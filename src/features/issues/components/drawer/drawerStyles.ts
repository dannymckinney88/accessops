export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const inlineActionClass =
  "ml-3 inline-flex items-center rounded-sm px-1.5 py-1 text-xs font-medium text-foreground underline underline-offset-4 outline-none transition-colors hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

export const externalLinkClass =
  "inline-flex items-center rounded-sm px-1.5 py-1 text-xs font-medium text-foreground underline underline-offset-4 outline-none transition-colors hover:bg-interactive-hover hover:text-interactive-hover-foreground active:bg-interactive-active active:text-interactive-active-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";

export const drawerSelectClass =
  "h-8 rounded-md border border-input bg-background px-2 pr-7 text-sm text-foreground outline-none transition-colors hover:border-interactive-border-hover hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2";
