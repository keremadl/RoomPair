"use client";
import { useId, type ReactNode } from "react";
import { Check } from "../../icons";
import { cx } from "../../cx";
import s from "./ChoiceCards.module.css";

export type ChoiceCardOption<T extends string> = {
  value: T;
  title: string;
  hint?: string;
  icon?: ReactNode;
};

/**
 * A question answered by picking one card (radio group). For choices that
 * need a sentence each; use SegmentedControl for short labels.
 */
export function ChoiceCards<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 1,
  className,
}: {
  label: string;
  options: ChoiceCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Two columns from tablet width up. */
  columns?: 1 | 2;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cx(s.group, className)} data-columns={columns}>
      <legend className={s.legend}>{label}</legend>
      <div className={s.options}>
        {options.map((o) => (
          <label
            key={o.value}
            className={s.choice}
            data-checked={value === o.value}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.icon && <span className={s.icon}>{o.icon}</span>}
            <span className={s.text}>
              <strong>{o.title}</strong>
              {o.hint && <small>{o.hint}</small>}
            </span>
            <span className={s.tick} aria-hidden="true">
              {value === o.value && <Check />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
