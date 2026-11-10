/**
 * Registry of RoomPair's design language. The team chose F · Card with the
 * Tabs layout; the other five candidates are archived (see
 * docs/archive/design-languages.md). The registry keeps its list shape so a
 * language can be added back without changing the pages that read it.
 */
import type { ComponentType } from "react";
import type { DetailsLayout } from "../components/ProfileDetails/ProfileDetails";
import * as card from "./card";

export { directionFontVariables } from "./fonts";

export type DirectionId = "card";

/** Swatches are read from the palette's own token file, so colours live in CSS only. */
export type Palette = { id: string; name: string };

export type Direction = {
  id: DirectionId;
  name: string;
  idea: string;
  /** What makes this a different design language, not just a palette. */
  principles: { label: string; value: string }[];
  swatches: string[];
  /** Optional colour palettes for the same language. The first is the default. */
  palettes?: Palette[];
};

export const directions: Direction[] = [
  {
    id: "card",
    name: "F · Card",
    idea: "Everyone as a game character card: age, stats, skills, quests.",
    principles: [
      {
        label: "Layout",
        value:
          "A card framed in its type colour; you-vs-them stats below and the room as an item card.",
      },
      {
        label: "Type",
        value: "Rubik: rounded and bold, yet readable at full size.",
      },
      {
        label: "Shape",
        value: "Thick outlines, pressable 3D buttons, stat pips and a fit bar.",
      },
      {
        label: "Motion",
        value: "Playful and bouncy; buttons sink when pressed.",
      },
      {
        label: "Details",
        value:
          "Fit is a % score; match reasons are completed quests, things to discuss are open ones.",
      },
    ],
    swatches: ["--type-host", "--type-explorer", "--color-primary", "--xp"],
  },
];

/** The chosen language and layout: the app always uses these. */
export const defaultLanguage: DirectionId = "card";
export const defaultLayout: DetailsLayout = "tabs";

/** Each language's Discover screen. */
export const screens: Record<
  DirectionId,
  ComponentType<{ layout?: DetailsLayout }>
> = {
  card: card.DiscoverScreen,
};

/**
 * Each language's controlled Discover parts, for apps that own the deck:
 * Card (swipe + actions) and Details (Home → Person → Fit).
 */
export const discoverParts = {
  card: { Card: card.DiscoverCard, Details: card.DiscoverDetails },
} satisfies Record<DirectionId, { Card: unknown; Details: unknown }>;

/** Signature components: what each language adds on top of the shared core. */
export const signatures: Record<
  DirectionId,
  { name: string; purpose: string }[]
> = {
  card: [
    {
      name: "Banner",
      purpose: "Game-style heading with a pressed icon badge.",
    },
    { name: "Stat", purpose: "Stat pips on the character card." },
    { name: "Versus", purpose: "Their stat and yours as two pip rows." },
    { name: "Trait", purpose: "A trait row, ticked when it works with you." },
    { name: "HomeItem", purpose: "The room as an item card with fact coins." },
  ],
};
