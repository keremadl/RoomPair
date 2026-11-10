"use client";
import { useMemo, useState } from "react";
import { defaultPreferences, profiles } from "@/lib/data";
import { rankProfiles } from "@/lib/matching";
import type {
  Frequency,
  MatchResult,
  NoiseTolerance,
  Preferences,
  Profile,
  Sharing,
  SleepSchedule,
} from "@/lib/types";

export type Decision = "like" | "pass";
export type Mode = "people" | "rooms";

/** The demo user ("you") the profiles are compared with. */
export const you: Preferences = { ...defaultPreferences, intent: "either" };
const ranked = rankProfiles(profiles, you);

/** Deck state shared by every design language: position, undo, search mode. */
export function useDeck() {
  const [mode, setMode] = useState<Mode>("people");
  const [position, setPosition] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  const [exitDirection, setExitDirection] = useState(1);

  const deck = useMemo(
    () =>
      ranked.filter(({ profile }) =>
        mode === "rooms" ? profile.intent === "have-room" : true,
      ),
    [mode],
  );
  const index = ((position % deck.length) + deck.length) % deck.length;
  const { profile, match } = deck[index];

  return {
    mode,
    profile,
    match,
    index,
    total: deck.length,
    cardKey: `${mode}-${position}`,
    exitDirection,
    canUndo: history.length > 0,
    changeMode(next: Mode) {
      setMode(next);
      setPosition(0);
      setHistory([]);
    },
    decide(decision: Decision) {
      setExitDirection(decision === "like" ? 1 : -1);
      setHistory((h) => [...h, decision]);
      setPosition((p) => p + 1);
    },
    undo() {
      if (!history.length) return;
      setExitDirection(-1);
      setHistory((h) => h.slice(0, -1));
      setPosition((p) => p - 1);
    },
  };
}

export type Deck = ReturnType<typeof useDeck>;

/**
 * What a language's DiscoverCard needs from a deck. The demo `useDeck` and the
 * real app's store both provide it.
 */
export type DiscoverDeck = {
  profile: Profile;
  match: MatchResult;
  /** Changes whenever a different card is on top (drives the exit animation). */
  cardKey: string;
  exitDirection: number;
  canUndo: boolean;
  decide: (d: Decision) => void;
  undo: () => void;
  index: number;
  total: number;
};
export type { MatchResult, Profile };

/* ── Labels shared by every language ── */

/** "1 Feb 2027", in the app's language (read from <html lang>, set by i18n). */
export const dateLabel = (iso: string) => {
  const lang =
    typeof document !== "undefined" ? document.documentElement.lang : "";
  return new Date(iso).toLocaleDateString(
    lang && lang !== "en" ? lang : "en-GB",
    // The value is a calendar date, not a moment: without this, people west
    // of UTC would see the day before.
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
};

export const intentLabel = (p: Profile) =>
  p.intent === "have-room" ? "Has a room" : "Looking together";

export const sleepLabel: Record<SleepSchedule, string> = {
  early: "Early riser",
  flexible: "Flexible",
  late: "Night owl",
};

export const guestsLabel: Record<Frequency, string> = {
  rarely: "Rarely",
  sometimes: "Sometimes",
  often: "Often",
};

export const homeDaysLabel: Record<Frequency, string> = {
  rarely: "Out most days",
  sometimes: "Home some days",
  often: "Home most days",
};

export const noiseLabel: Record<NoiseTolerance, string> = {
  low: "Needs it quiet",
  medium: "Some noise is fine",
  high: "Noise doesn't bother me",
};

export const sharingLabel: Record<Sharing, string> = {
  separate: "Keeps things separate",
  some: "Shares the basics",
  most: "Shares most things",
};

export const tidinessLabel = [
  "",
  "Relaxed",
  "Easy-going",
  "Tidy",
  "Very tidy",
  "Spotless",
];
export const socialLabel = [
  "",
  "Quiet",
  "Low-key",
  "Balanced",
  "Social",
  "Very social",
];

/** Habit rows comparing the profile with you. */
export function habitRows(p: Profile) {
  return [
    {
      label: "Tidiness",
      them: p.habits.cleanliness,
      you: you.cleanliness,
      scale: tidinessLabel,
    },
    {
      label: "Social energy",
      them: p.habits.social,
      you: you.social,
      scale: socialLabel,
    },
  ];
}

/** Rough clock times for a sleep schedule, used to sketch someone's day. */
export const dayClock: Record<SleepSchedule, { wake: string; bed: string }> = {
  early: { wake: "06:30", bed: "22:00" },
  flexible: { wake: "08:00", bed: "23:30" },
  late: { wake: "10:00", bed: "01:00" },
};

export const socialEvening = [
  "",
  "Quiet evenings in",
  "Mostly quiet, the odd guest",
  "Friends over now and then",
  "Often has friends over",
  "Something on most nights",
];
