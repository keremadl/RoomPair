"use client";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../cx";
import styles from "./Tabs.module.css";

export type TabItem<T extends string> = { id: T; label: ReactNode };

export type TabsProps<T extends string> = {
  /** Accessible name of the tab list. */
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** id of the element the tabs control (the tab panel). */
  controls: string;
  /** Prefix for tab ids, so a panel can point back with aria-labelledby. */
  idPrefix: string;
  className?: string;
  tabClassName?: string;
  /** Skip the core look entirely (when a language supplies its own classes). */
  unstyled?: boolean;
};

/**
 * Accessible tab list (WAI-ARIA tabs pattern): one tab stop, arrow keys
 * move between tabs, Home/End jump to the ends. Render the panel yourself
 * with role="tabpanel", id={controls} and aria-labelledby={`${idPrefix}-${value}`}.
 */
export function Tabs<T extends string>({
  label,
  items,
  value,
  onChange,
  controls,
  idPrefix,
  className,
  tabClassName,
  unstyled = false,
}: TabsProps<T>) {
  const refs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const onKeyDown = (e: KeyboardEvent) => {
    const i = items.findIndex((t) => t.id === value);
    const target =
      e.key === "ArrowRight"
        ? items[(i + 1) % items.length]
        : e.key === "ArrowLeft"
          ? items[(i + items.length - 1) % items.length]
          : e.key === "Home"
            ? items[0]
            : e.key === "End"
              ? items[items.length - 1]
              : null;
    if (!target) return;
    e.preventDefault();
    onChange(target.id);
    refs.current[target.id]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(!unstyled && styles.tabs, className)}
      onKeyDown={onKeyDown}
    >
      {items.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          type="button"
          role="tab"
          id={`${idPrefix}-${t.id}`}
          aria-controls={controls}
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          data-group={t.id}
          className={cx(!unstyled && styles.tab, tabClassName)}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
