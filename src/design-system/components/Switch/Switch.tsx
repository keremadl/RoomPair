"use client";
import { useId, type ComponentProps } from "react";
import { cx } from "../../cx";
import styles from "./Switch.module.css";

export type SwitchProps = Omit<ComponentProps<"input">, "type" | "onChange"> & {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** On/off setting with a visible label (native checkbox with role="switch"). */
export function Switch({
  label,
  description,
  checked,
  onChange,
  className,
  id,
  ...rest
}: SwitchProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label className={cx(styles.row, className)} htmlFor={inputId}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </span>
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
