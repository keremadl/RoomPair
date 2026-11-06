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

export type Fact = { label: string; value: string; note?: string };

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

export function homeSection(p: Profile): HomeSection {
  if (p.room) {
    const r = p.room;
    return {
      kind: "listing",
      heading: "The room",
      summary: `€${p.room.price} a month in ${p.neighborhood}, from ${dateLabel(p.moveDate)}`,
      facts: [
        {
          label: "Rent",
          value: `€${r.price}`,
          note: r.billsIncluded
            ? "per month, bills included"
            : "per month, bills extra",
        },
        { label: "Deposit", value: `€${r.deposit}` },
        { label: "Available", value: dateLabel(p.moveDate) },
        { label: "Minimum stay", value: `${p.stayMonths} months` },
        { label: "Area", value: `${p.neighborhood}, ${p.city}` },
        ...(r.transport
          ? [{ label: "Getting there", value: r.transport }]
          : []),
        {
          label: "Bathroom",
          value: r.privateBathroom ? "Your own" : "Shared",
        },
        {
          label: "Furniture",
          value: r.furnished ? "Furnished" : "Unfurnished",
        },
        {
          label: "Living there now",
          value:
            r.flatmates === 0
              ? "Nobody yet"
              : r.flatmates === 1
                ? "1 person"
                : `${r.flatmates} people`,
        },
        ...(r.houseRules
          ? [{ label: "House rules", value: r.houseRules }]
          : []),
      ],
      photo: p.room.photo,
      photos: p.room.photos?.length ? p.room.photos : [p.room.photo],
      title: p.room.title,
      description: withoutPrice(p.room.description),
    };
  }
  return {
    kind: "search",
    heading: "The home they want",
    summary: `No room yet. Searching for €${p.budget[0]}–${p.budget[1]} around ${p.neighborhood}`,
    facts: [
      {
        label: "Budget",
        value: `€${p.budget[0]}–${p.budget[1]}`,
        note: "per month",
      },
      { label: "Move-in", value: dateLabel(p.moveDate) },
      { label: "Stay", value: `${p.stayMonths} months` },
      { label: "Area", value: `${p.neighborhood} or nearby` },
    ],
    description: `${p.name} doesn't have a room yet and would like to find a place together with a flatmate.`,
  };
}

/** `viewer`: whose answers to compare with; the demo user by default. */
export function personSection(
  p: Profile,
  viewer: Preferences = you,
): PersonSection {
  const v = viewer;
  return {
    heading: `About ${p.name}`,
    summary: `${p.occupation}, ${p.age}`,
    facts: [
      {
        label: p.status === "working" ? "Works" : "Studies",
        value: p.occupation,
        note: p.university,
      },
      {
        label: "Checked",
        value: p.verified ? "Student email" : "Not yet",
        note: p.verified ? "demo" : undefined,
      },
      ...(p.languages.length
        ? [{ label: "Speaks", value: p.languages.join(", ") }]
        : []),
    ],
    bio: p.bio,
    interests: p.tags,
    prompts: p.prompts,
    habits: [
      {
        label: "Tidiness",
        them: tidinessLabel[p.habits.cleanliness],
        you: tidinessLabel[v.cleanliness],
        same: p.habits.cleanliness === v.cleanliness,
      },
      {
        label: "Social energy",
        them: socialLabel[p.habits.social],
        you: socialLabel[v.social],
        same: p.habits.social === v.social,
      },
      {
        label: "Sleep",
        them: sleepLabel[p.habits.sleep],
        you: sleepLabel[v.sleep],
        same: p.habits.sleep === v.sleep,
      },
      {
        label: "Smoking",
        them: p.habits.smoking ? "Smokes" : "Smoke-free",
        you: v.smokeFree ? "Smoke-free" : "Either is fine",
        same: !(p.habits.smoking && v.smokeFree),
      },
      {
        label: "Pets",
        them: p.habits.pets ? "Has a pet" : "No pets",
        you: v.petsOkay ? "Pets welcome" : "No pets",
        same: !(p.habits.pets && !v.petsOkay),
      },
      {
        label: "Guests",
        them: guestsLabel[p.habits.guests],
        you: guestsLabel[v.guests],
        same: p.habits.guests === v.guests,
      },
      {
        label: "In the day",
        them: homeDaysLabel[p.habits.homeDays],
        you: homeDaysLabel[v.homeDays],
        same: p.habits.homeDays === v.homeDays,
      },
      {
        label: "Noise",
        them: noiseLabel[p.habits.noise],
        you: noiseLabel[v.noise],
        same: p.habits.noise === v.noise,
      },
      {
        label: "Sharing",
        them: sharingLabel[p.habits.sharing],
        you: sharingLabel[v.sharing],
        same: p.habits.sharing === v.sharing,
      },
    ],
  };
}

export function fitSection(m: MatchResult): FitSection {
  return {
    score: m.score,
    summary: m.considerations.length
      ? `${m.reasons.length} things line up, ${m.considerations.length} to talk about`
      : `${m.reasons.length} things line up`,
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
