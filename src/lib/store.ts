"use client";
import { useEffect, useState } from "react";
import { defaultPreferences, conversations, profiles } from "./data";
import {
  ageFrom,
  defaultMe,
  hostPromptQuestions,
  isAdultBirthDate,
  promptQuestions,
  MAX_INTERESTS,
  MAX_PHOTOS,
  MAX_PROMPTS,
} from "./profile";
import type {
  Preferences,
  Conversation,
  Message,
  MyProfile,
  Prompt,
} from "./types";
export interface AppState {
  preferences: Preferences;
  decisions: { id: string; action: "like" | "pass" }[];
  chats: Conversation[];
  onboarded: boolean;
  blocked: string[];
  reports: { profileId: string; reason: string }[];
  me: MyProfile;
}
export const initialState: AppState = {
  preferences: defaultPreferences,
  decisions: [],
  chats: conversations,
  onboarded: false,
  blocked: [],
  reports: [],
  me: defaultMe,
};
export const STORAGE_KEY = "roompair-demo-v1";
/** A copy of a save that could not be read, kept so it is not lost. */
const BACKUP_KEY = `${STORAGE_KEY}.unreadable`;

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, fallback: string, max: number) =>
  typeof value === "string" ? value.slice(0, max) : fallback;
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const flag = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;
const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(value as T) ? (value as T) : fallback);
const list = (value: unknown, max = 500): unknown[] =>
  Array.isArray(value) ? value.slice(0, max) : [];
const strings = (value: unknown, max: number, length = 200) =>
  list(value, max)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.slice(0, length));
/** Photos are bundled images or pictures the user picked (data URLs). */
const isPhoto = (value: unknown): value is string =>
  typeof value === "string" &&
  (value.startsWith("/images/") || value.startsWith("data:image/"));

const frequency = ["rarely", "sometimes", "often"] as const;

function readPreferences(input: unknown): Preferences {
  const saved = isObject(input) ? input : {};
  const base = defaultPreferences;
  return {
    name: text(saved.name, base.name, 48),
    city: text(saved.city, base.city, 70),
    budgetMin: number(saved.budgetMin, base.budgetMin),
    budgetMax: number(saved.budgetMax, base.budgetMax),
    // A saved date that has passed would hide everyone; start from the default.
    moveDate:
      typeof saved.moveDate === "string" &&
      saved.moveDate >= new Date().toISOString().slice(0, 10)
        ? saved.moveDate.slice(0, 10)
        : base.moveDate,
    stayMonths: number(saved.stayMonths, base.stayMonths),
    // "Either" is no longer offered; treat it as looking for a room.
    intent: saved.intent === "have-room" ? "have-room" : "find-room",
    cleanliness: number(saved.cleanliness, base.cleanliness),
    social: number(saved.social, base.social),
    sleep: oneOf(saved.sleep, ["early", "flexible", "late"], base.sleep),
    guests: oneOf(saved.guests, frequency, base.guests),
    homeDays: oneOf(saved.homeDays, frequency, base.homeDays),
    noise: oneOf(saved.noise, ["low", "medium", "high"], base.noise),
    sharing: oneOf(saved.sharing, ["separate", "some", "most"], base.sharing),
    smokeFree: flag(saved.smokeFree, base.smokeFree),
    petsOkay: flag(saved.petsOkay, base.petsOkay),
    verifiedOnly: flag(saved.verifiedOnly, base.verifiedOnly),
    livingWith: oneOf(
      saved.livingWith,
      ["anyone", "women", "men"],
      base.livingWith,
    ),
  };
}

/** Older saves used questions without "…" or ones that were since removed. */
function readPrompts(input: unknown): Prompt[] {
  const known = [...promptQuestions, ...hostPromptQuestions];
  return list(input, 20)
    .filter(
      (prompt): prompt is { question: string; answer: string } =>
        isObject(prompt) &&
        typeof prompt.question === "string" &&
        typeof prompt.answer === "string",
    )
    .map((prompt) => ({
      question: known.includes(prompt.question)
        ? prompt.question
        : `${prompt.question}…`,
      answer: prompt.answer.slice(0, 400),
    }))
    .filter((prompt) => known.includes(prompt.question))
    .slice(0, MAX_PROMPTS);
}

function readMe(input: unknown): MyProfile {
  const saved = isObject(input) ? input : {};
  const room = isObject(saved.room) ? saved.room : {};
  const base = defaultMe;
  const gender = oneOf(saved.gender, ["woman", "man", "nonbinary"], "none");
  return {
    photos: Array.isArray(saved.photos)
      ? saved.photos
          .filter(isPhoto)
          // The old demo photo was replaced by a new one.
          .map((photo) =>
            photo === "/images/alex.jpg" ? "/images/alex-1.jpg" : photo,
          )
          .slice(0, MAX_PHOTOS)
      : base.photos,
    // The age follows from the date of birth; a state saved before the date
    // was asked keeps its age and has no date yet.
    ...(typeof saved.birthDate === "string" && isAdultBirthDate(saved.birthDate)
      ? { birthDate: saved.birthDate, age: ageFrom(saved.birthDate) }
      : "age" in saved
        ? { birthDate: "", age: number(saved.age, base.age) }
        : { birthDate: base.birthDate, age: base.age }),
    status: oneOf(saved.status, ["student", "working"], base.status),
    occupation: text(saved.occupation, base.occupation, 80),
    school: text(saved.school, base.school, 120),
    languages: Array.isArray(saved.languages)
      ? strings(saved.languages, 12, 40)
      : base.languages,
    ...(gender === "none" ? {} : { gender }),
    neighborhood: text(saved.neighborhood, base.neighborhood, 70),
    smokes: flag(saved.smokes, base.smokes),
    hasPets: flag(saved.hasPets, base.hasPets),
    bio: text(saved.bio, base.bio, 600),
    prompts: "prompts" in saved ? readPrompts(saved.prompts) : base.prompts,
    interests: Array.isArray(saved.interests)
      ? strings(saved.interests, MAX_INTERESTS, 40)
      : base.interests,
    verified: flag(saved.verified, base.verified),
    room: {
      photos: list(room.photos, MAX_PHOTOS).filter(isPhoto),
      title: text(room.title, base.room.title, 120),
      price: number(room.price, base.room.price),
      billsIncluded: flag(room.billsIncluded, base.room.billsIncluded),
      description: text(room.description, base.room.description, 1200),
      deposit: number(room.deposit, base.room.deposit),
      privateBathroom: flag(room.privateBathroom, base.room.privateBathroom),
      furnished: flag(room.furnished, base.room.furnished),
      flatmates: number(room.flatmates, base.room.flatmates),
      transport: text(room.transport, base.room.transport, 120),
      houseRules: text(room.houseRules, base.room.houseRules, 400),
    },
  };
}

/**
 * localStorage is untrusted input: it can be edited by hand, cut short, or
 * left over from an older build. Every field is checked; anything malformed,
 * or pointing at a person who is no longer in the demo, is dropped instead of
 * crashing a page. Returns null when the payload is not a RoomPair state.
 */
export function sanitizeState(input: unknown): AppState | null {
  if (
    !isObject(input) ||
    !isObject(input.preferences) ||
    !Array.isArray(input.decisions) ||
    !Array.isArray(input.chats)
  )
    return null;
  const people = new Set(profiles.map((profile) => profile.id));

  const decisions: AppState["decisions"] = [];
  for (const decision of list(input.decisions))
    if (
      isObject(decision) &&
      typeof decision.id === "string" &&
      people.has(decision.id) &&
      (decision.action === "like" || decision.action === "pass") &&
      !decisions.some((item) => item.id === decision.id)
    )
      decisions.push({ id: decision.id, action: decision.action });

  const chats: Conversation[] = [];
  for (const chat of list(input.chats)) {
    if (
      !isObject(chat) ||
      typeof chat.id !== "string" ||
      typeof chat.profileId !== "string" ||
      !people.has(chat.profileId) ||
      chats.some((item) => item.profileId === chat.profileId)
    )
      continue;
    const messages: Message[] = [];
    for (const message of list(chat.messages, 2000))
      if (
        isObject(message) &&
        typeof message.id === "string" &&
        typeof message.text === "string" &&
        (message.sender === "me" || message.sender === "them")
      )
        messages.push({
          id: message.id,
          sender: message.sender,
          text: message.text.slice(0, 2000),
          ...(isPhoto(message.photo) ? { photo: message.photo } : {}),
          time: text(message.time, "", 20),
          ...(typeof message.day === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(message.day)
            ? { day: message.day }
            : {}),
        });
    chats.push({
      id: chat.id,
      profileId: chat.profileId,
      messages,
      unread: Math.max(0, Math.floor(number(chat.unread, 0))),
      matchedAt: text(chat.matchedAt, "", 40),
    });
  }

  const reports: AppState["reports"] = [];
  for (const report of list(input.reports))
    if (
      isObject(report) &&
      typeof report.profileId === "string" &&
      people.has(report.profileId) &&
      typeof report.reason === "string"
    )
      reports.push({
        profileId: report.profileId,
        reason: report.reason.slice(0, 200),
      });

  return {
    preferences: readPreferences(input.preferences),
    decisions,
    chats,
    onboarded: input.onboarded === true,
    blocked: [...new Set(strings(input.blocked, 500))].filter((id) =>
      people.has(id),
    ),
    reports,
    me: readMe(input.me),
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  /** The last save did not fit or was refused; changes live only in memory. */
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? sanitizeState(JSON.parse(raw)) : null;
      if (saved) setState(saved);
      else if (raw) throw new Error("Unreadable saved state");
    } catch {
      // Start from the demo defaults, but keep the unreadable save aside
      // rather than overwriting it for good.
      try {
        if (raw) localStorage.setItem(BACKUP_KEY, raw);
      } catch {
        /* Nothing more can be done if storage itself is unavailable. */
      }
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveFailed(false);
    } catch {
      // Usually the storage quota: photos are kept as data URLs. The session
      // keeps working in memory and the interface says so.
      setSaveFailed(true);
    }
  }, [state, ready]);
  return {
    state,
    setState,
    ready,
    saveFailed,
    reset: () => setState(structuredClone(initialState)),
  };
}
