import type { ReactNode } from "react";
import { cx } from "../../cx";
import { Button } from "../Button/Button";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  secondary?: { label: string; onClick: () => void };
  className?: string;
};

/** What to show when a list is empty: what will appear and how to get there. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  secondary,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <h2 className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}
      {(action || secondary) && (
        <div className={styles.actions}>
          {action && (
            <Button onClick={action.onClick} trailingIcon={action.icon}>
              {action.label}
            </Button>
          )}
          {secondary && (
            <Button variant="ghost" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
