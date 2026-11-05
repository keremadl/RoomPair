import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../cx";
import styles from "./IconButton.module.css";

export type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  icon: ReactNode;
  variant?: "ghost" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
};

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        styles.iconButton,
        styles[variant],
        styles[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
