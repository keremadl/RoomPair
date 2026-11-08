"use client";
import { useEffect, useState } from "react";
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

function read(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
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

/**
 * The chosen palette and theme, and the theme in effect: "system" resolves
 * to light or dark from the device and follows it when it changes.
 */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(fallback);
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    setAppearance(read());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const theme: "light" | "dark" =
    appearance.theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : appearance.theme;
  const update = (next: Partial<Appearance>) =>
    setAppearance((current) => {
      const value = { ...current, ...next };
      try {
        localStorage.setItem(KEY, JSON.stringify(value));
      } catch {}
      return value;
    });
  return { appearance, theme, update };
}
