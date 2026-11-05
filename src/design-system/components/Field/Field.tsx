"use client";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "../../cx";
import styles from "./Field.module.css";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Text or icon before the value, e.g. "€". */
  prefix?: ReactNode;
  className?: string;
};

export type InputProps = FieldProps & Omit<ComponentProps<"input">, "prefix">;
export type TextareaProps = FieldProps & ComponentProps<"textarea">;

function useFieldIds(id?: string) {
  const generated = useId();
  const inputId = id ?? generated;
  return { inputId, hintId: `${inputId}-hint`, errorId: `${inputId}-error` };
}

function describedBy(
  hint: string | undefined,
  error: string | undefined,
  ids: ReturnType<typeof useFieldIds>,
) {
  return (
    [hint && ids.hintId, error && ids.errorId].filter(Boolean).join(" ") ||
    undefined
  );
}

function FieldShell({
  label,
  hint,
  error,
  ids,
  className,
  children,
}: FieldProps & { ids: ReturnType<typeof useFieldIds>; children: ReactNode }) {
  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={ids.inputId}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className={styles.hint} id={ids.hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className={styles.error} id={ids.errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Labelled text input. Label is required — placeholders are not labels. */
export function Input({
  label,
  hint,
  error,
  prefix,
  className,
  id,
  ...rest
}: InputProps) {
  const ids = useFieldIds(id);
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      ids={ids}
      className={className}
    >
      <div className={cx(styles.control, error && styles.invalid)}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={ids.inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, ids)}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: TextareaProps) {
  const ids = useFieldIds(id);
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      ids={ids}
      className={className}
    >
      <div
        className={cx(
          styles.control,
          styles.multiline,
          error && styles.invalid,
        )}
      >
        <textarea
          id={ids.inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, ids)}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}
