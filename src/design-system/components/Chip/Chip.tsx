import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../cx";
import styles from "./Chip.module.css";

export type ChipProps = ComponentProps<"button"> & {
  selected?: boolean;
  icon?: ReactNode;
  /** "onImage" for chips placed on top of photos. */
  surface?: "default" | "onImage";
};

/**
 * Selectable tag (habits, filters, lifestyle prompts).
 * Renders a toggle button; pass `selected` and `onClick`.
 * For a read-only label, render with `disabled` false and no onClick, or use Badge.
 */
export function Chip({
  selected = false,
  icon,
  surface = "default",
  className,
  children,
  type = "button",
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={rest.onClick ? selected : undefined}
      className={cx(
        styles.chip,
        styles[surface],
        selected && styles.selected,
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
