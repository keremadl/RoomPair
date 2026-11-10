"use client";
import { useEffect, useState } from "react";
import { defaultPreferences, conversations, profiles, rooms } from "./data";
import type { Preferences, Conversation, Message } from "./types";
export interface AppState {
  preferences: Preferences;
  decisions: { id: string; action: "like" | "pass" }[];
  chats: Conversation[];
  savedRooms: string[];
  checklist: string[];
  notes: string;
  onboarded: boolean;
  blocked: string[];
  reports: { profileId: string; reason: string }[];
  viewing: string;
}
export const initialState: AppState = {
  preferences: defaultPreferences,
  decisions: [],
  chats: conversations,
  savedRooms: ["room-ella"],
  checklist: ["budget"],
  notes: "",
  onboarded: false,
  blocked: [],
  reports: [],
  viewing: "",
};
export const STORAGE_KEY = "roompair-demo-v1";

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, fallback: string, max: number) =>
  typeof value === "string" ? value.slice(0, max) : fallback;
const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value.slice(0, 500) : [];
const strings = (value: unknown, allowed?: Set<string>) => [
  ...new Set(
    list(value).filter(
      (item): item is string =>
        typeof item === "string" && (!allowed || allowed.has(item)),
    ),
  ),
];

function readPreferences(input: unknown): Preferences {
  const saved = isObject(input) ? input : {};
  const base = defaultPreferences;
  const number = (key: keyof Preferences) =>
    typeof saved[key] === "number" && Number.isFinite(saved[key])
      ? (saved[key] as number)
      : (base[key] as number);
  const flag = (key: keyof Preferences) =>
    typeof saved[key] === "boolean"
      ? (saved[key] as boolean)
      : (base[key] as boolean);
  return {
    name: text(saved.name, base.name, 48).trim() || base.name,
    city: text(saved.city, base.city, 70),
    budgetMin: number("budgetMin"),
    budgetMax: number("budgetMax"),
    moveDate: text(saved.moveDate, base.moveDate, 10),
    stayMonths: number("stayMonths"),
    intent: ["find-room", "have-room", "either"].includes(
      saved.intent as string,
    )
      ? (saved.intent as Preferences["intent"])
      : base.intent,
    cleanliness: number("cleanliness"),
    social: number("social"),
    sleep: ["early", "flexible", "late"].includes(saved.sleep as string)
      ? (saved.sleep as Preferences["sleep"])
      : base.sleep,
    smokeFree: flag("smokeFree"),
    petsOkay: flag("petsOkay"),
    verifiedOnly: flag("verifiedOnly"),
  };
}

/**
 * localStorage is untrusted input: it can be edited by hand, truncated, or left
 * over from an older build. Anything malformed or pointing at a profile or room
 * that no longer exists is dropped instead of crashing the app. Returns null
 * when the payload is not a RoomPair state at all.
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
  const roomIds = new Set(rooms.map((room) => room.id));
  const seenChats = new Set<string>();
  const chats: Conversation[] = [];
  for (const chat of list(input.chats)) {
    if (
      !isObject(chat) ||
      typeof chat.id !== "string" ||
      typeof chat.profileId !== "string" ||
      !people.has(chat.profileId) ||
      seenChats.has(chat.profileId)
    )
      continue;
    seenChats.add(chat.profileId);
    const messages: Message[] = [];
    for (const message of list(chat.messages)) {
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
          time: text(message.time, "", 20),
        });
    }
    chats.push({
      id: chat.id,
      profileId: chat.profileId,
      messages,
      unread:
        typeof chat.unread === "number" && chat.unread > 0
          ? Math.floor(chat.unread)
          : 0,
      matchedAt: text(chat.matchedAt, "", 40),
    });
  }
  const decisions: AppState["decisions"] = [];
  for (const decision of list(input.decisions)) {
    if (
      isObject(decision) &&
      typeof decision.id === "string" &&
      people.has(decision.id) &&
      (decision.action === "like" || decision.action === "pass") &&
      !decisions.some((item) => item.id === decision.id)
    )
      decisions.push({ id: decision.id, action: decision.action });
  }
  const reports: AppState["reports"] = [];
  for (const report of list(input.reports)) {
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
  }
  return {
    preferences: readPreferences(input.preferences),
    decisions,
    chats,
    savedRooms: strings(input.savedRooms, roomIds),
    checklist: strings(input.checklist),
    notes: text(input.notes, "", 20_000),
    onboarded: input.onboarded === true,
    blocked: strings(input.blocked, people),
    reports,
    viewing: text(input.viewing, "", 40),
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? sanitizeState(JSON.parse(raw)) : null;
      if (saved) setState(saved);
    } catch {
      /* Unreadable or corrupt storage: start from the original demo state. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStorageFailed(false);
      } catch {
        // Storage is full or disabled; the session keeps working in memory
        // and the interface tells the user that changes will not persist.
        setStorageFailed(true);
      }
    }
  }, [state, ready]);
  return {
    state,
    setState,
    ready,
    storageFailed,
    reset: () => setState(structuredClone(initialState)),
  };
}
