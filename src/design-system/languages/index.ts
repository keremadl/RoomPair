/**
 * Registry of RoomPair's design languages. Each language is a package in
 * this folder (theme tokens, signature components, Discover screen, README);
 * this file lists them for pages that switch between languages.
 */
import type { ComponentType } from "react";
import type { DetailsLayout } from "../components/ProfileDetails/ProfileDetails";
import * as chat from "./chat";
import * as collage from "./collage";
import * as poster from "./poster";
import * as day from "./day";
import * as plan from "./plan";
import * as card from "./card";

export { directionFontVariables } from "./fonts";

export type DirectionId =
  "chat" | "collage" | "poster" | "day" | "plan" | "card";

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
    id: "chat",
    name: "A · Chat",
    idea: "You read the profile like a first chat with a future flatmate.",
    principles: [
      {
        label: "Layout",
        value:
          "A photo card with question-and-answer bubbles below: rent, move-in, room, habits.",
      },
      {
        label: "Type",
        value:
          "Atkinson Hyperlegible, a typeface designed for low-vision readers. 17px body, generous line height.",
      },
      {
        label: "Shape",
        value: "Soft corners, left-aligned bubbles; no italics, no all caps.",
      },
      {
        label: "Motion",
        value:
          "On a new profile the messages appear one by one and the card tilts gently.",
      },
      {
        label: "Details",
        value:
          "Habits sit inside the answers; every line says 'same as you' or shows your preference.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-primary",
      "--bubble-you",
      "--color-accent",
    ],
  },
  {
    id: "collage",
    name: "B · Collage",
    idea: "A dorm fridge door: polaroids, stickers, personality first.",
    principles: [
      {
        label: "Layout",
        value:
          "A slightly tilted polaroid with stickers on top. Details in speech bubbles and colour blocks.",
      },
      {
        label: "Type",
        value:
          "A bold grotesque with character (Bricolage Grotesque 800) and Figtree.",
      },
      {
        label: "Shape",
        value:
          "2px outlines, hard offset shadows, generous rounding, saturated sticker colours.",
      },
      {
        label: "Motion",
        value: "A bouncy spring. The card tilts clearly while dragged.",
      },
      {
        label: "Details",
        value:
          "Habits as block meters, them and you; fit as thick coloured bars.",
      },
    ],
    swatches: [
      "--color-bg",
      "--color-primary",
      "--sticker-lime",
      "--sticker-pink",
    ],
    palettes: [
      { id: "lavender", name: "Lavender" },
      { id: "forest", name: "Forest" },
      { id: "sunset", name: "Sunset" },
      { id: "night", name: "Night" },
    ],
  },
  {
    id: "poster",
    name: "C · Poster",
    idea: "As clear as a gig poster: flat colour bands, huge numbers, readable at a glance.",
    principles: [
      {
        label: "Layout",
        value:
          "A square photo, full-width colour bands below and a 2×2 grid of huge numbers.",
      },
      {
        label: "Type",
        value:
          "Archivo Black for headings and big numbers, Archivo for body text.",
      },
      {
        label: "Shape",
        value:
          "No corners, no shadows, no outlines; only flat fields of colour.",
      },
      {
        label: "Motion",
        value: "Fast and crisp: no tilt, the card slides away at once.",
      },
      {
        label: "Details",
        value:
          "Habits side by side in huge numbers (them / you); Pass and Like split the screen at the bottom.",
      },
    ],
    swatches: ["--band-red", "--band-sky", "--band-mint", "--band-ink"],
  },
  {
    id: "day",
    name: "D · Day",
    idea: "You read the profile as an ordinary day you would share with them.",
    principles: [
      {
        label: "Layout",
        value:
          "A photo card with a morning-to-night timeline below, plus a calendar and a budget bar.",
      },
      {
        label: "Type",
        value:
          "Lexend, a typeface designed for reading fluency. Calm and widely spaced.",
      },
      {
        label: "Shape",
        value:
          "Soft cards; colours carry meaning: morning, noon, evening, night.",
      },
      {
        label: "Motion",
        value:
          "Gentle; the card tilts slightly and the timeline refreshes with each profile.",
      },
      {
        label: "Details",
        value:
          "Waking up, evenings, tidiness and quiet hours next to your day: 'same' or 'a little different'.",
      },
    ],
    swatches: [
      "--color-bg",
      "--time-morning",
      "--time-evening",
      "--time-night",
    ],
  },
  {
    id: "plan",
    name: "E · Floor plan",
    idea: "The home you would share as an architect's drawing; facts as clear as a spec sheet.",
    principles: [
      {
        label: "Layout",
        value:
          "A photo with a label tab; details as numbered drawing sheets: 01 Home, 02 Person, 03 Fit.",
      },
      {
        label: "Type",
        value: "Schibsted Grotesk: a clear, technical yet warm grotesque.",
      },
      {
        label: "Shape",
        value:
          "Navy lines, a drafting-paper grid and one coral highlight: your room.",
      },
      {
        label: "Motion",
        value: "Minimal and precise; moving between rooms is a short fade.",
      },
      {
        label: "Details",
        value:
          "The home sheet shows the floor plan with your room highlighted; the person and habits sit in a separate spec table.",
      },
    ],
    swatches: ["--color-bg", "--plan-line", "--color-accent", "--plan-yours"],
  },
  {
    id: "card",
    name: "F · Card",
    idea: "Everyone as a game character card: level, stats, skills, quests.",
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
        value: "Thick outlines, pressable 3D buttons, stat pips and an XP bar.",
      },
      {
        label: "Motion",
        value: "Playful and bouncy; buttons sink when pressed.",
      },
      {
        label: "Details",
        value:
          "Fit is XP; match reasons are completed quests, things to discuss are open ones.",
      },
    ],
    swatches: ["--type-host", "--type-explorer", "--color-primary", "--xp"],
  },
];

/** Each language's Discover screen. */
export const screens: Record<
  DirectionId,
  ComponentType<{ layout?: DetailsLayout }>
> = {
  chat: chat.DiscoverScreen,
  collage: collage.DiscoverScreen,
  poster: poster.DiscoverScreen,
  day: day.DiscoverScreen,
  plan: plan.DiscoverScreen,
  card: card.DiscoverScreen,
};

/**
 * Each language's controlled Discover parts, for apps that own the deck:
 * Card (swipe + actions) and Details (Home → Person → Fit).
 */
export const discoverParts = {
  chat: { Card: chat.DiscoverCard, Details: chat.DiscoverDetails },
  collage: { Card: collage.DiscoverCard, Details: collage.DiscoverDetails },
  poster: { Card: poster.DiscoverCard, Details: poster.DiscoverDetails },
  day: { Card: day.DiscoverCard, Details: day.DiscoverDetails },
  plan: { Card: plan.DiscoverCard, Details: plan.DiscoverDetails },
  card: { Card: card.DiscoverCard, Details: card.DiscoverDetails },
} satisfies Record<DirectionId, { Card: unknown; Details: unknown }>;

/** Signature components: what each language adds on top of the shared core. */
export const signatures: Record<
  DirectionId,
  { name: string; purpose: string }[]
> = {
  chat: [
    {
      name: "Divider",
      purpose: "Section divider pill, like a date line in a chat app.",
    },
    {
      name: "Thread",
      purpose:
        "Question and answer bubbles; yours on the right, theirs on the left.",
    },
    {
      name: "HomeThread",
      purpose: "Home group: facts card, then the room as a photo bubble.",
    },
    {
      name: "PersonThread",
      purpose: "Person group: bio, interests, prompt and habits as replies.",
    },
    {
      name: "FitCard",
      purpose: "Fit group: score, reasons and the expandable breakdown.",
    },
  ],
  collage: [
    {
      name: "GroupTitle",
      purpose: "Tilted sticker heading, one colour per group.",
    },
    { name: "Blocks", purpose: "Five-step block meter for a 1–5 habit." },
    {
      name: "HomeStickers",
      purpose: "Home group: fact stickers and the room as a taped polaroid.",
    },
    {
      name: "PersonStickers",
      purpose: "Person group: speech bubble, vibe meters and lifestyle tiles.",
    },
    { name: "FitBars", purpose: "Fit group: chunky outlined score bars." },
  ],
  poster: [
    { name: "Band", purpose: "Full-width colour band that opens a group." },
    {
      name: "HomeBands",
      purpose: "Home group: 2×2 numeral tiles and the room on an ink band.",
    },
    {
      name: "PersonBands",
      purpose: "Person group: bio, prompt band and the numeral habit table.",
    },
    { name: "FitBand", purpose: "Fit group: giant score and thick bars." },
  ],
  day: [
    { name: "GroupTitle", purpose: "Heading with a time-of-day icon chip." },
    {
      name: "Moment",
      purpose: "One entry on the day timeline, marked same or different.",
    },
    {
      name: "MoveCalendar",
      purpose: "Month view with their move-in date and yours.",
    },
    {
      name: "BudgetBar",
      purpose: "Rent (or their range) against your budget.",
    },
  ],
  plan: [
    {
      name: "SheetTitle",
      purpose: "Numbered drawing-sheet heading: 01 Home, 02 Person, 03 Fit.",
    },
    {
      name: "FlatDrawing",
      purpose: "SVG floor plan of the flat, your room highlighted.",
    },
    {
      name: "SpecTable",
      purpose: "Label and value rows, like a specification.",
    },
    {
      name: "HomeSpec / PersonSpec",
      purpose: "Home and Person groups as drawing and spec tables.",
    },
    { name: "Fit", purpose: "Fit group: score and bar table." },
  ],
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
