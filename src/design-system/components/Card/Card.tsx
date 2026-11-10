import type { ComponentProps } from "react";
import { cx } from "../../cx";
import styles from "./Card.module.css";

export type CardProps = ComponentProps<"div"> & {
  variant?: "outline" | "raised" | "sunken";
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds hover/focus affordance. Use with an inner link/button. */
  interactive?: boolean;
};

export function Card({
  variant = "outline",
  padding = "md",
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        styles.card,
        styles[variant],
        styles[`pad-${padding}`],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    />
  );
}
