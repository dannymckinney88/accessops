"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FilterOption<T extends string = string> = {
  id: T;
  label: string;
};

export type FilterOptionGroup<T extends string = string> = {
  groupLabel: string;
  options: FilterOption<T>[];
};

interface FilterMultiSelectProps<T extends string = string> {
  id: string;
  label: string;
  options: FilterOption<T>[];
  selectedIds: T[];
  onToggle: (id: T) => void;
  onClear: () => void;
  className?: string;
  groups?: FilterOptionGroup<T>[];
}

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "[href]",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true",
  );

export const FilterMultiSelect = <T extends string>({
  id,
  label,
  options,
  selectedIds,
  onToggle,
  onClear,
  className,
  groups,
}: FilterMultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstCheckboxRef = useRef<HTMLInputElement>(null);

  const labelId = `${id}-label`;
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;
  const statusId = `${id}-status`;
  const helpId = `${id}-help`;

  const selectedCount = selectedIds.length;

  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.label),
    [options, selectedIds],
  );

  const triggerText =
    selectedCount === 0
      ? "All"
      : selectedCount === 1
        ? selectedLabels[0]
        : `${selectedCount} selected`;

  const triggerSummary =
    selectedCount === 0
      ? `${label}, all ${options.length} options included`
      : selectedCount === 1
        ? `${label}, ${selectedLabels[0]} selected`
        : `${label}, ${selectedCount} of ${options.length} options selected`;

  const statusText =
    selectedCount === 0
      ? `No options selected. All ${options.length} options are currently included.`
      : selectedCount === 1
        ? `1 option selected out of ${options.length}.`
        : `${selectedCount} options selected out of ${options.length}.`;

  const closePanel = () => {
    setIsOpen(false);
  };

  const closePanelAndFocusTrigger = () => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const openPanel = () => {
    setIsOpen(true);
  };

  const togglePanel = () => {
    setIsOpen((open) => !open);
  };

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!containerRef.current?.contains(target)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      openPanel();
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closePanel();
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanelAndFocusTrigger();
      return;
    }

    if (
      event.key === "ArrowDown" &&
      document.activeElement === panelRef.current
    ) {
      event.preventDefault();
      firstCheckboxRef.current?.focus();
      return;
    }

    if (event.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    // Trap focus inside the open filter until Done or Escape.
    if (event.shiftKey) {
      if (active === first || active === panel) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1 ${className ?? ""}`}
    >
      <span id={labelId} className="text-xs font-medium text-foreground/70">
        {label}
      </span>

      <span id={summaryId} className="sr-only">
        {triggerSummary}
      </span>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-describedby={summaryId}
        aria-labelledby={`${labelId} ${triggerId}`}
        onClick={togglePanel}
        onKeyDown={handleTriggerKeyDown}
        className={`inline-flex h-8 w-full items-center justify-between gap-1.5 rounded-md border px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-offset-2 ${
          selectedCount > 0
            ? "border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground"
            : "border-input bg-background text-foreground/80 hover:border-interactive-border-hover hover:bg-interactive-hover hover:text-interactive-hover-foreground"
        }`}
      >
        <span className="truncate">{triggerText}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 shrink-0 opacity-60"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          aria-describedby={`${statusId} ${helpId}`}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          className="absolute top-full left-0 z-20 mt-1 min-w-56 max-w-72 rounded-md border border-input bg-background shadow-md outline-none"
        >
          <div className="border-b border-input px-3 py-2">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {label} filter
            </p>
            <p
              id={statusId}
              aria-live="polite"
              aria-atomic="true"
              className="mt-1 text-xs text-foreground sr-only"
            >
              {statusText}
            </p>
            <p
              id={helpId}
              className="mt-1 text-[11px] text-muted-foreground sr-only"
            >
              Tab stays within this filter. Press Escape or Done to close.
            </p>
          </div>

          <fieldset className="border-0 p-0">
            <legend className="sr-only">{`${label} options`}</legend>

            <div className="max-h-60 overflow-y-auto px-1 py-1">
              {groups && groups.length > 0 ? (
                groups.map((group, groupIndex) => (
                  <div key={group.groupLabel}>
                    {groups.length > 1 && (
                      <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:pt-1">
                        {group.groupLabel}
                      </p>
                    )}
                    {group.options.map((option, optionIndex) => {
                      const isFirst = groupIndex === 0 && optionIndex === 0;
                      const checked = selectedIds.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-interactive-hover focus-within:bg-interactive-hover"
                        >
                          <input
                            ref={isFirst ? firstCheckboxRef : undefined}
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(option.id)}
                            className="size-3.5 shrink-0 rounded border-input"
                          />
                          <span className="min-w-0 flex-1">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ))
              ) : (
                options.map((option, index) => {
                  const checked = selectedIds.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-interactive-hover focus-within:bg-interactive-hover"
                    >
                      <input
                        ref={index === 0 ? firstCheckboxRef : undefined}
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(option.id)}
                        className="size-3.5 shrink-0 rounded border-input"
                      />
                      <span className="min-w-0 flex-1">{option.label}</span>
                    </label>
                  );
                })
              )}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-2 border-t border-input px-2 py-2">
            <button
              type="button"
              onClick={onClear}
              disabled={selectedCount === 0}
              aria-label={`Clear ${label} filter`}
              className="rounded-sm px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-interactive-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={closePanelAndFocusTrigger}
              className="rounded-sm px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-interactive-hover focus-visible:ring-2 focus-visible:ring-interactive-focus-ring focus-visible:ring-inset"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
