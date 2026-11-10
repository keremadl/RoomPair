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
  action,
  children,
  className,
}: {
  icon?: ReactNode;
  label: string;
  /** A small control at the end of the label row, e.g. an Edit button. */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(s.section, className)}>
      <div className={s.head}>
        <h4 className={s.label}>
          {icon}
          {label}
        </h4>
        {action}
      </div>
      {children}
    </section>
  );
}

export type FactChip = {
  text: string;
  icon?: ReactNode;
  /** `match` and `differ` compare two people; `interest` is a hobby. */
  tone?: "neutral" | "match" | "differ" | "interest";
  /** Makes the pill a button, e.g. to change that one answer. */
  onClick?: () => void;
  /** What the pill is about, read out before its text when it is a button. */
  label?: string;
};

/** Short facts as pills, each with its own icon. */
export function FactChips({ items }: { items: FactChip[] }) {
  return (
    <ul className={s.chips}>
      {items.map((item) => (
        <li key={item.text} data-tone={item.tone ?? "neutral"}>
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              aria-label={
                item.label ? `${item.label}: ${item.text}` : undefined
              }
            >
              {item.icon}
              {item.text}
            </button>
          ) : (
            <>
              {item.icon}
              {item.text}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

/** A few lines about someone, one under the other, each with an icon. */
export function FactRows({
  items,
}: {
  items: { text: string; icon?: ReactNode; onClick?: () => void }[];
}) {
  return (
    <ul className={s.rows}>
      {items.map((item) => (
        <li key={item.text}>
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.icon}
              {item.text}
            </button>
          ) : (
            <>
              {item.icon}
              {item.text}
            </>
          )}
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

/**
 * The top of a profile opened on its own (from a chat or a like): the photo,
 * large, with the name and one line about the person on it.
 */
export function DetailHero({
  src,
  title,
  subtitle,
  action,
}: {
  src: string;
  /** The name line; it is the profile's heading. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** A round button in the photo's top left corner, e.g. options. */
  action?: ReactNode;
}) {
  return (
    <header className={s.hero}>
      <img src={src} alt="" />
      {action && <div className={s.heroAction}>{action}</div>}
      <div className={s.heroText}>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
