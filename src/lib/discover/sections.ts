/**
 * The content model for a profile. Every design language and layout reads the
 * same three groups, so information always lives in the same place:
 *
 *   Home   — the place: rent, availability, stay, area, the room itself.
 *            For someone without a room: what they are searching for.
 *   Person — who you would live with: studies, bio, interests, prompt,
 *            and everyday habits compared with yours.
 *   Fit    — how the two of you compare: score, reasons, things to discuss.
 *
 * Nothing about the place appears under Person, and nothing about the person
 * appears under Home.
 */
import type { Preferences, Prompt } from "@/lib/types";
import { english, type Translate } from "@/lib/translate";
import {
  dateLabel,
  guestsLabel,
  homeDaysLabel,
  noiseLabel,
  sharingLabel,
  sleepLabel,
  socialLabel,
  tidinessLabel,
  you,
  type MatchResult,
  type Profile,
} from "./deck";

/** `id` lets a layout find a fact without matching its (translated) label. */
export type Fact = { id?: string; label: string; value: string; note?: string };

export type HomeSection = {
  kind: "listing" | "search";
  heading: string;
  summary: string;
  facts: Fact[];
  photo?: string;
  /** Every room photo, the main one first. */
  photos?: string[];
  title?: string;
  description: string;
};

export type HabitRow = {
  label: string;
  them: string;
  you: string;
  same: boolean;
};

export type PersonSection = {
  heading: string;
  summary: string;
  facts: Fact[];
  bio: string;
  interests: string[];
  /** Up to three; the first is the one on the card. */
  prompts: Prompt[];
  habits: HabitRow[];
};

export type FitSection = {
  score: number;
  summary: string;
  reasons: string[];
  discuss: string[];
  breakdown: { label: string; score: number; detail: string; weight: number }[];
};

/** Room descriptions end with a price sentence that the facts already show. */
const withoutPrice = (text: string) =>
  text.replace(/\s*€\d+\/month[^.]*\.\s*$/, "").trim();

export function homeSection(p: Profile, t: Translate = english): HomeSection {
  const months = (n: number) => t("{count} months", { count: n });
  if (p.room) {
    const r = p.room;
    return {
      kind: "listing",
      heading: t("The room"),
      summary: t("€{price} a month in {area}, from {date}", {
        price: r.price,
        area: p.neighborhood,
        date: dateLabel(p.moveDate),
      }),
      facts: [
        {
          label: t("Rent"),
          value: `€${r.price}`,
          note: r.billsIncluded
            ? t("per month, bills included")
            : t("per month, bills extra"),
        },
        { label: t("Deposit"), value: `€${r.deposit}` },
        { label: t("Available"), value: dateLabel(p.moveDate) },
        { label: t("Minimum stay"), value: months(p.stayMonths) },
        { label: t("Area"), value: `${p.neighborhood}, ${p.city}` },
        ...(r.transport
          ? [{ label: t("Getting there"), value: r.transport }]
          : []),
        {
          label: t("Bathroom"),
          value: r.privateBathroom ? t("Your own") : t("Shared"),
        },
        {
          label: t("Furniture"),
          value: r.furnished ? t("Furnished") : t("Unfurnished"),
        },
        {
          label: t("Living there now"),
          value:
            r.flatmates === 0
              ? t("Nobody yet")
              : r.flatmates === 1
                ? t("1 person")
                : t("{count} people", { count: r.flatmates }),
        },
        ...(r.houseRules
          ? [{ label: t("House rules"), value: r.houseRules }]
          : []),
      ],
      photo: r.photo,
      photos: r.photos?.length ? r.photos : [r.photo],
      title: r.title,
      description: withoutPrice(r.description),
    };
  }
  return {
    kind: "search",
    heading: t("The home they want"),
    summary: t("No room yet. Searching for €{min}–{max} around {area}", {
      min: p.budget[0],
      max: p.budget[1],
      area: p.neighborhood,
    }),
    facts: [
      {
        label: t("Budget"),
        value: `€${p.budget[0]}–${p.budget[1]}`,
        note: t("per month"),
      },
      { label: t("Move-in"), value: dateLabel(p.moveDate) },
      { label: t("Stay"), value: months(p.stayMonths) },
      {
        label: t("Area"),
        value: t("{area} or nearby", { area: p.neighborhood }),
      },
    ],
    description: t(
      "{name} doesn't have a room yet and would like to find a place together with a flatmate.",
      { name: p.name },
    ),
  };
}

/** `viewer`: whose answers to compare with; the demo user by default. */
export function personSection(
  p: Profile,
  viewer: Preferences = you,
  t: Translate = english,
): PersonSection {
  const v = viewer;
  // Callers pass translated text, so the extractor sees every t() argument.
  const row = (label: string, them: string, mine: string, same: boolean) => ({
    label,
    them,
    you: mine,
    same,
  });
  return {
    heading: t("About {name}", { name: p.name }),
    summary: `${p.occupation}, ${p.age}`,
    facts: [
      {
        id: "work",
        label: p.status === "working" ? t("Works") : t("Studies"),
        value: p.occupation,
        note: p.university,
      },
      {
        id: "checked",
        label: t("Checked"),
        value: p.verified ? t("Student email") : t("Not yet"),
        note: p.verified ? t("demo") : undefined,
      },
      ...(p.languages.length
        ? [
            {
              id: "speaks",
              label: t("Speaks"),
              value: p.languages.map((l) => t(l)).join(", "),
            },
          ]
        : []),
    ],
    bio: p.bio,
    interests: p.tags.map((tag) => t(tag)),
    prompts: p.prompts.map((pr) => ({ ...pr, question: t(pr.question) })),
    habits: [
      row(
        t("Tidiness"),
        t(tidinessLabel[p.habits.cleanliness]),
        t(tidinessLabel[v.cleanliness]),
        p.habits.cleanliness === v.cleanliness,
      ),
      row(
        t("Social energy"),
        t(socialLabel[p.habits.social]),
        t(socialLabel[v.social]),
        p.habits.social === v.social,
      ),
      row(
        t("Sleep"),
        t(sleepLabel[p.habits.sleep]),
        t(sleepLabel[v.sleep]),
        p.habits.sleep === v.sleep,
      ),
      row(
        t("Smoking"),
        t(p.habits.smoking ? "Smokes" : "Smoke-free"),
        t(v.smokeFree ? "Smoke-free" : "Either is fine"),
        !(p.habits.smoking && v.smokeFree),
      ),
      row(
        t("Pets"),
        t(p.habits.pets ? "Has a pet" : "No pets"),
        t(v.petsOkay ? "Pets welcome" : "No pets"),
        !(p.habits.pets && !v.petsOkay),
      ),
      row(
        t("Guests"),
        t(guestsLabel[p.habits.guests]),
        t(guestsLabel[v.guests]),
        p.habits.guests === v.guests,
      ),
      row(
        t("In the day"),
        t(homeDaysLabel[p.habits.homeDays]),
        t(homeDaysLabel[v.homeDays]),
        p.habits.homeDays === v.homeDays,
      ),
      row(
        t("Noise"),
        t(noiseLabel[p.habits.noise]),
        t(noiseLabel[v.noise]),
        p.habits.noise === v.noise,
      ),
      row(
        t("Sharing"),
        t(sharingLabel[p.habits.sharing]),
        t(sharingLabel[v.sharing]),
        p.habits.sharing === v.sharing,
      ),
    ],
  };
}

/** Pass the same `t` as to getCompatibility; reasons arrive translated. */
export function fitSection(m: MatchResult, t: Translate = english): FitSection {
  return {
    score: m.score,
    summary: m.considerations.length
      ? t("{lineUp} things line up, {discuss} to talk about", {
          lineUp: m.reasons.length,
          discuss: m.considerations.length,
        })
      : t("{lineUp} things line up", { lineUp: m.reasons.length }),
    reasons: m.reasons,
    discuss: m.considerations,
    breakdown: m.breakdown.map((b) => ({
      label: b.label,
      score: b.score,
      detail: b.detail.replace(/ · \d+% weight/, ""),
      weight: Number(/(\d+)% weight/.exec(b.detail)?.[1] ?? 0),
    })),
  };
}
