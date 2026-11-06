"use client";
import type { ReactNode } from "react";
import { ChevronRight } from "../../icons";
import { useText } from "../../text/TextProvider";
import s from "./ListRow.module.css";

/**
 * One editable fact: icon, label, value, chevron. An empty value shows
 * "Add", so missing information stays visible. A row that only opens
 * something (help, a page) sets `link` and shows no value at all.
 * Group rows in a ListGroup.
 */
export function ListRow({
  icon,
  label,
  value,
  onClick,
  link = false,
}: {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
  /** Opens something rather than holding a value: no value, no "Add". */
  link?: boolean;
}) {
  const t = useText();
  const empty = value === undefined || value === null || value === "";
  const inner = (
    <>
      {icon && <span className={s.icon}>{icon}</span>}
      <span className={s.label}>{label}</span>
      {!link && (
        <span className={s.value} data-empty={empty || undefined}>
          {empty ? t("Add") : value}
        </span>
      )}
      {onClick && <ChevronRight className={s.chevron} aria-hidden="true" />}
    </>
  );
  return (
    <li className={s.item}>
      {onClick ? (
        <button type="button" className={s.row} onClick={onClick}>
          {inner}
        </button>
      ) : (
        <div className={s.row}>{inner}</div>
      )}
    </li>
  );
}

/** A titled list of ListRows. */
export function ListGroup({
  title,
  hint,
  children,
  id,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={s.group} aria-labelledby={title ? id : undefined}>
      {title && (
        <h2 className={s.title} id={id}>
          {title}
        </h2>
      )}
      {hint && <p className={s.hint}>{hint}</p>}
      <ul className={s.list}>{children}</ul>
    </section>
  );
}
