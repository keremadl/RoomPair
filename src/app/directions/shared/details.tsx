"use client";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type GroupId = "home" | "person" | "fit";
export type DetailsLayout = "blocks" | "tabs";

const order: GroupId[] = ["home", "person", "fit"];

export type DetailsClasses = {
  blocks: string;
  block: string;
  tabs: string;
  tab: string;
  panel: string;
};

/**
 * Arranges the three content groups. Every design language uses this, so the
 * order and grouping are identical everywhere:
 *
 *   blocks — Home, Person, Fit stacked, each with its own header.
 *   tabs   — one group at a time behind a tab bar (arrow keys move between tabs).
 *
 * Languages supply the look: headers, tab labels, section bodies and classes.
 */
export function ProfileDetails({
  layout,
  headers,
  tabLabels,
  sections,
  classes,
}: {
  layout: DetailsLayout;
  headers: Record<GroupId, ReactNode>;
  tabLabels: Record<GroupId, ReactNode>;
  sections: Record<GroupId, ReactNode>;
  classes: DetailsClasses;
}) {
  const base = useId();
  const [active, setActive] = useState<GroupId>("home");
  const tabRefs = useRef<Partial<Record<GroupId, HTMLButtonElement | null>>>(
    {},
  );

  if (layout === "blocks") {
    return (
      <div className={classes.blocks}>
        {order.map((g) => (
          <section
            key={g}
            className={classes.block}
            data-group={g}
            aria-labelledby={`${base}-${g}`}
          >
            <div id={`${base}-${g}`}>{headers[g]}</div>
            {sections[g]}
          </section>
        ))}
      </div>
    );
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const i = order.indexOf(active);
    const next =
      e.key === "ArrowRight"
        ? order[(i + 1) % order.length]
        : e.key === "ArrowLeft"
          ? order[(i + order.length - 1) % order.length]
          : e.key === "Home"
            ? order[0]
            : e.key === "End"
              ? order[order.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div
        className={classes.tabs}
        role="tablist"
        aria-label="Profile sections"
        onKeyDown={onKeyDown}
      >
        {order.map((g) => (
          <button
            key={g}
            ref={(el) => {
              tabRefs.current[g] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${g}`}
            aria-controls={`${base}-panel`}
            aria-selected={active === g}
            tabIndex={active === g ? 0 : -1}
            data-group={g}
            className={classes.tab}
            onClick={() => setActive(g)}
          >
            {tabLabels[g]}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${active}`}
        className={classes.panel}
        data-group={active}
      >
        {headers[active]}
        {sections[active]}
      </div>
    </div>
  );
}
