import { cx } from "../../cx";
import s from "./Progress.module.css";

/** A labelled bar from 0 to 100, e.g. "20% complete". */
export function Progress({
  value,
  label,
  text,
  className,
}: {
  value: number;
  /** Accessible name, e.g. "Profile complete". */
  label: string;
  /** Visible text next to the bar, e.g. "20% complete". */
  text?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx(s.progress, className)}>
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
