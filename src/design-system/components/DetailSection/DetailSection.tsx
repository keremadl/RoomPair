import type { ReactNode } from "react";
import { cx } from "../../cx";
import s from "./DetailSection.module.css";

/**
 * One part of a profile: a small label over one kind of content. A profile is
 * a column of these, all the same shape, so the eye learns the rhythm once:
 * chips for short facts, rows for who someone is, a pull quote for an answer
 * in their own words, plain text for a description.
 */
export function DetailSection({
  icon,
  label,
  children,
  className,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(s.section, className)}>
      <h4 className={s.label}>
        {icon}
        {label}
      </h4>
      {children}
    </section>
  );
}

export type FactChip = {
  text: string;
  icon?: ReactNode;
  /** `match` and `differ` compare two people; `interest` is a hobby. */
  tone?: "neutral" | "match" | "differ" | "interest";
};

/** Short facts as pills, each with its own icon. */
export function FactChips({ items }: { items: FactChip[] }) {
  return (
    <ul className={s.chips}>
      {items.map((item) => (
        <li key={item.text} data-tone={item.tone ?? "neutral"}>
          {item.icon}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/** A few lines about someone, one under the other, each with an icon. */
export function FactRows({
  items,
}: {
  items: { text: string; icon?: ReactNode }[];
}) {
  return (
    <ul className={s.rows}>
      {items.map((item) => (
        <li key={item.text}>
          {item.icon}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/** An answer in the person's own words, set large. */
export function PullQuote({ children }: { children: ReactNode }) {
  return <p className={s.quote}>{children}</p>;
}

/** A photo between two sections, as wide as they are. */
export function DetailPhoto({ src, alt }: { src: string; alt: string }) {
  return <img className={s.photo} src={src} alt={alt} loading="lazy" />;
}
