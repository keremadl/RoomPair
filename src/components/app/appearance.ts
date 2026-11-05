"use client";
import { useEffect, useState } from "react";
import type { DetailsLayout } from "@/design-system";
import { directions, type DirectionId } from "@/design-system/languages";

export type Appearance = {
  language: DirectionId;
  /** Kolaj palette id; undefined = the language's default palette. */
  palette?: string;
  layout: DetailsLayout;
};

const KEY = "roompair-appearance-v1";
const fallback: Appearance = { language: "collage", layout: "blocks" };

/** The chosen design language, palette and detail layout, remembered on this device. */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(fallback);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved && directions.some((d) => d.id === saved.language)) {
        setAppearance({
          language: saved.language,
          palette:
            typeof saved.palette === "string" ? saved.palette : undefined,
          layout: saved.layout === "tabs" ? "tabs" : "blocks",
        });
      }
    } catch {
      /* Storage is optional. */
    }
  }, []);
  const update = (next: Partial<Appearance>) =>
    setAppearance((current) => {
      const merged = { ...current, ...next };
      if (next.language && next.language !== current.language)
        merged.palette = undefined;
      try {
        localStorage.setItem(KEY, JSON.stringify(merged));
      } catch {
        /* Storage is optional. */
      }
      return merged;
    });
  return [appearance, update] as const;
}
