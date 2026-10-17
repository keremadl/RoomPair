"use client";
import { useEffect, useState } from "react";
import { defaultPreferences, conversations } from "./data";
import type { Preferences, Conversation } from "./types";
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
            preferences: { ...defaultPreferences, ...saved.preferences },
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
