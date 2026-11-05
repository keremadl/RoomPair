"use client";
import { useId, useState, type ReactNode } from "react";
import { Tabs } from "../Tabs/Tabs";
import styles from "./ProfileDetails.module.css";

export type GroupId = "home" | "person" | "fit";
export type DetailsLayout = "blocks" | "tabs";

const order: GroupId[] = ["home", "person", "fit"];

export type DetailsClasses = Partial<{
  blocks: string;
  block: string;
  tabs: string;
  tab: string;
  panel: string;
}>;

export type ProfileDetailsProps = {
  layout: DetailsLayout;
  headers: Record<GroupId, ReactNode>;
  tabLabels: Record<GroupId, ReactNode>;
  sections: Record<GroupId, ReactNode>;
  /** Language-specific classes; anything left out uses the core look. */
  classes?: DetailsClasses;
};

/**
 * Arranges a profile's three content groups, always in the order
 * Home → Person → Fit:
 *
 *   blocks — stacked, each with its own header; nothing is hidden.
 *   tabs   — one group at a time behind a sticky tab bar.
 *
 * Every design language uses this, so grouping and order never differ;
 * only the look does.
 */
export function ProfileDetails({
  layout,
  headers,
  tabLabels,
  sections,
  classes = {},
}: ProfileDetailsProps) {
  const base = useId();
  const [active, setActive] = useState<GroupId>("home");

  if (layout === "blocks") {
    return (
      <div className={classes.blocks ?? styles.blocks}>
        {order.map((g) => (
          <section
            key={g}
            className={classes.block ?? styles.block}
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

  return (
    <div>
      <Tabs
        label="Profile sections"
        idPrefix={`${base}-tab`}
        controls={`${base}-panel`}
        items={order.map((g) => ({ id: g, label: tabLabels[g] }))}
        value={active}
        onChange={setActive}
        className={classes.tabs ?? styles.tabs}
        tabClassName={classes.tab}
        unstyled={Boolean(classes.tab)}
      />
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${active}`}
        className={classes.panel ?? styles.panel}
        data-group={active}
      >
        {headers[active]}
        {sections[active]}
      </div>
    </div>
  );
}
