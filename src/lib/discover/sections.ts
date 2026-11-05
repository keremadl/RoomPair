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
import {
  dateLabel,
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
  prompt: { question: string; answer: string };
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
    return {
      kind: "listing",
      heading: "The room",
      summary: `€${p.room.price} a month in ${p.neighborhood}, from ${dateLabel(p.moveDate)}`,
      facts: [
        {
          label: "Rent",
          value: `€${p.room.price}`,
          note: "per month, bills included",
        },
        { label: "Available", value: dateLabel(p.moveDate) },
        { label: "Minimum stay", value: `${p.stayMonths} months` },
        { label: "Area", value: `${p.neighborhood}, ${p.city}` },
      ],
      photo: p.room.photo,
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

export function personSection(p: Profile): PersonSection {
  return {
    heading: `About ${p.name}`,
    summary: `${p.occupation}, ${p.age}`,
    facts: [
      { label: "Studies", value: p.occupation, note: p.university },
      {
        label: "Checked",
        value: p.verified ? "Student email" : "Not yet",
        note: p.verified ? "demo" : undefined,
      },
    ],
    bio: p.bio,
    interests: p.tags,
    prompt: p.prompt,
    habits: [
      {
        label: "Tidiness",
        them: tidinessLabel[p.habits.cleanliness],
        you: tidinessLabel[you.cleanliness],
        same: p.habits.cleanliness === you.cleanliness,
      },
      {
        label: "Social energy",
        them: socialLabel[p.habits.social],
        you: socialLabel[you.social],
        same: p.habits.social === you.social,
      },
      {
        label: "Sleep",
        them: sleepLabel[p.habits.sleep],
        you: sleepLabel[you.sleep],
        same: p.habits.sleep === you.sleep,
      },
      {
        label: "Smoking",
        them: p.habits.smoking ? "Smokes" : "Smoke-free",
        you: you.smokeFree ? "Smoke-free" : "Either is fine",
        same: !(p.habits.smoking && you.smokeFree),
      },
      {
        label: "Pets",
        them: p.habits.pets ? "Has a pet" : "No pets",
        you: you.petsOkay ? "Pets welcome" : "No pets",
        same: !(p.habits.pets && !you.petsOkay),
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
