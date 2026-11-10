"use client";
import { useEffect, useState } from "react";
import { defaultPreferences, conversations } from "./data";
import { defaultMe, hostPromptQuestions, promptQuestions } from "./profile";
import type { Preferences, Conversation, MyProfile } from "./types";
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
const KEY = "roompair-demo-v1";

/** Older saves used questions without "…" or ones that were since removed. */
function migratePrompts(prompts: MyProfile["prompts"]) {
  const known = [...promptQuestions, ...hostPromptQuestions];
  return prompts
    .map((p) => ({
      ...p,
      question: known.includes(p.question) ? p.question : `${p.question}…`,
    }))
    .filter((p) => known.includes(p.question));
}
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
              prompts: migratePrompts(saved.me?.prompts ?? defaultMe.prompts),
              // The old demo photo was replaced by a new one.
              photos: (saved.me?.photos ?? defaultMe.photos).map((p: string) =>
                p === "/images/alex.jpg" ? "/images/alex-1.jpg" : p,
              ),
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
