"use client";
import { useEffect, useState } from "react";
import { defaultPreferences, conversations } from "./data";
import { defaultMe } from "./profile";
import type { Preferences, Conversation, MyProfile } from "./types";
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
  /** Planned viewing per saved room id (datetime-local value). */
  viewings: Record<string, string>;
  me: MyProfile;
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
  viewings: {},
  me: defaultMe,
};
const KEY = "roompair-demo-v1";
export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved?.preferences &&
          Array.isArray(saved.decisions) &&
          Array.isArray(saved.chats)
        )
          setState({
            ...initialState,
            ...saved,
            me: {
              ...defaultMe,
              ...saved.me,
              room: { ...defaultMe.room, ...saved.me?.room },
            },
            preferences: {
              ...defaultPreferences,
              ...saved.preferences,
              // "Either" is no longer offered; treat it as looking for a room.
              intent:
                saved.preferences.intent === "have-room"
                  ? "have-room"
                  : "find-room",
            },
            // v1 stored one viewing for the whole plan; attach it to the first saved room.
            viewings:
              saved.viewings ??
              (saved.viewing && saved.savedRooms?.[0]
                ? { [saved.savedRooms[0]]: saved.viewing }
                : {}),
          });
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, ready]);
  return {
    state,
    setState,
    ready,
    reset: () => setState(structuredClone(initialState)),
  };
}
