import { cx } from "../../cx";
import s from "./Progress.module.css";

/** A labelled bar from 0 to 100, e.g. "20% complete". */
export function Progress({
  value,
  label,
  text,
  compact = false,
  className,
}: {
  value: number;
  /** Accessible name, e.g. "Profile complete". */
  label: string;
  /** Visible text next to the bar, e.g. "20% complete". */
  text?: string;
  /** Small enough for a top bar: short bar, text above it. */
  compact?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cx(s.progress, className)}
      data-compact={compact || undefined}
    >
      {text && <span className={s.text}>{text}</span>}
      <div
        className={s.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
      >
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
