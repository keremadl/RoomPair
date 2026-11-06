"use client";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cx } from "../../cx";
import { IconButton } from "../IconButton/IconButton";
import s from "./TopBar.module.css";

/**
 * The bar at the top of every screen. Two uses:
 * - a tab's main page: the page title, and its icons on the right;
 * - a sub-page (settings, edit profile…): a back button before the title,
 *   and optional content under the title (`below`, e.g. a Progress).
 * The title is the page's h1.
 */
export function TopBar({
  title,
  actions,
  onBack,
  backLabel = "Back",
  below,
  className,
}: {
  title: string;
  /** Icon buttons on the right. */
  actions?: ReactNode;
  /** Turns the bar into a sub-page bar with a back button. */
  onBack?: () => void;
  backLabel?: string;
  /** Shown under the title, e.g. how complete something is. */
  below?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx(s.bar, className)} data-sub={onBack ? "" : undefined}>
      <div className={s.row}>
        {onBack && (
          <IconButton
            label={backLabel}
            icon={<ChevronLeft />}
            onClick={onBack}
            className={s.back}
          />
        )}
        <h1 className={s.title}>{title}</h1>
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
      {below && <div className={s.below}>{below}</div>}
    </header>
  );
}
