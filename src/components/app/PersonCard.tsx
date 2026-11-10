"use client";
import c from "./PersonCard.module.css";

/** Five pips for a 1–5 habit, as on the Discover card. */
export function Pips({
  label,
  value,
  bare = false,
}: {
  label: string;
  value: number;
  /** Only the dots (the row already names the habit). */
  bare?: boolean;
}) {
  return (
    <span className={c.stat}>
      {!bare && <span>{label}</span>}
      <span className={c.pips} role="img" aria-label={`${label}: ${value} / 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} data-on={n <= value} />
        ))}
      </span>
    </span>
  );
}
