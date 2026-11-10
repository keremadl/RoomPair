import type { ComponentProps } from "react";
import { cx } from "../../cx";
import styles from "./Badge.module.css";

export type BadgeTone =
  "neutral" | "primary" | "accent" | "success" | "warning" | "danger";

export type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
  /** Small leading dot, e.g. for status. */
  dot?: boolean;
};

/** Non-interactive label: counts, statuses, "Has a room". For selectable tags use Chip. */
export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
