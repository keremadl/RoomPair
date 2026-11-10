"use client";
import type { ReactNode } from "react";
import { ChevronLeft } from "../../icons";
import { cx } from "../../cx";
import { IconButton } from "../IconButton/IconButton";
import s from "./TopBar.module.css";

/**
 * The bar at the top of every screen. Two uses:
 * - a tab's main page: the page title, and its icons on the right;
 * - a sub-page (settings, edit profile…): a back button before the title;
 *   its right side holds icons or a compact status such as a Progress.
 * The bar has the same height on every page.
 * The title is the page's h1.
 * A page about one person (an open conversation) adds `person`: their photo
 * before the name and one short line under it; pressing either opens them.
 */
export function TopBar({
  title,
  actions,
  onBack,
  backLabel = "Back",
  person,
  className,
}: {
  title: string;
  /** Icon buttons, or a compact status (e.g. Progress compact), on the right. */
  actions?: ReactNode;
  /** Turns the bar into a sub-page bar with a back button. */
  onBack?: () => void;
  backLabel?: string;
  /** Whose page this is: a photo, a line under the name, and what a press does. */
  person?: {
    avatar: ReactNode;
    subtitle?: ReactNode;
    /** The button's accessible name, e.g. "View profile: Maya". */
    label: string;
    onOpen: () => void;
  };
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
        {person ? (
          <div className={s.person}>
            {/* The button covers the whole block, so the name is pressable too. */}
            <button
              type="button"
              className={s.personOpen}
              aria-label={person.label}
              onClick={person.onOpen}
            >
              {person.avatar}
            </button>
            <div className={s.personText}>
              <h1 className={s.title}>{title}</h1>
              {person.subtitle && (
                <p className={s.subtitle}>{person.subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <h1 className={s.title}>{title}</h1>
        )}
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
    </header>
  );
}
