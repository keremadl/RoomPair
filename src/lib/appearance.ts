"use client";
import { useSyncExternalStore } from "react";
import {
  defaultPalette,
  palettes,
  type PaletteId,
} from "@/design-system/languages/card/palettes";

/** Light, dark, or follow the device. */
export type ThemeChoice = "system" | "light" | "dark";
export type Appearance = { palette: PaletteId; theme: ThemeChoice };

/**
 * Kept apart from the demo data, so "Reset demo data" keeps your look.
 * The lab's reset clears keys starting with "roompair-"; this one uses a dot.
 */
const KEY = "roompair.appearance";
const fallback: Appearance = { palette: defaultPalette, theme: "system" };

let cachedRaw: string | null | undefined;
let cachedAppearance: Appearance = fallback;
const listeners = new Set<() => void>();

function parseAppearance(raw: string | null): Appearance {
  try {
    const saved = JSON.parse(raw ?? "null");
    const palette = palettes.some((p) => p.id === saved?.palette)
      ? (saved.palette as PaletteId)
      : fallback.palette;
    const theme: ThemeChoice = ["system", "light", "dark"].includes(
      saved?.theme,
    )
      ? saved.theme
      : fallback.theme;
    return { palette, theme };
  } catch {
    return fallback;
  }
}

function getAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedAppearance = parseAppearance(raw);
    }
  } catch {
    cachedAppearance = fallback;
  }
  return cachedAppearance;
}

function subscribeAppearance(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeSystemDark(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSystemDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/**
 * The chosen palette and theme, and the theme in effect: "system" resolves
 * to light or dark from the device and follows it when it changes.
 */
export function useAppearance() {
  const appearance = useSyncExternalStore(
    subscribeAppearance,
    getAppearance,
    () => fallback,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDark,
    () => false,
  );
  const theme: "light" | "dark" =
    appearance.theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : appearance.theme;
  const update = (next: Partial<Appearance>) => {
    const value: Appearance = { ...getAppearance(), ...next };
    const serialized = JSON.stringify(value);
    cachedRaw = serialized;
    cachedAppearance = value;
    try {
      localStorage.setItem(KEY, serialized);
    } catch {}
    listeners.forEach((notify) => notify());
  };
  return { appearance, theme, update };
}
