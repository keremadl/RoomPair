"use client";
import { useId } from "react";
import { cx } from "../../cx";
import styles from "./Slider.module.css";

export type SliderProps = {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Words at each end of the scale, e.g. "Relaxed" / "Spotless". */
  ends?: [string, string];
  /** Text for the current value, read by screen readers. */
  valueText?: string;
  className?: string;
};

/** A labelled range input for 1–5 style preferences. */
export function Slider({
  label,
  hint,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  ends,
  valueText,
  className,
}: SliderProps) {
  const id = useId();
  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {valueText && <span className={styles.value}>{valueText}</span>}
      </label>
      {hint && <p className={styles.hint}>{hint}</p>}
      <input
        id={id}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {ends && (
        <div className={styles.ends} aria-hidden="true">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}
