import type { ReactNode } from "react";
import { cx } from "../../cx";
import styles from "./SectionHeader.module.css";

export type SectionHeaderProps = {
  title: string;
  icon?: ReactNode;
  /** One line under the title. Use it only when the section body is hidden. */
  summary?: string;
  level?: 2 | 3 | 4;
  /** Content group, exposed as data-group for language styling. */
  group?: string;
  className?: string;
};

/** Heading for a profile section: icon, title, optional one-line summary. */
export function SectionHeader({
  title,
  icon,
  summary,
  level = 3,
  group,
  className,
}: SectionHeaderProps) {
  const Tag = `h${level}` as "h3";
  return (
    <div className={cx(styles.header, className)} data-group={group}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>
        <Tag className={styles.title}>{title}</Tag>
        {summary && <span className={styles.summary}>{summary}</span>}
      </span>
    </div>
  );
}
