"use client";
import { createContext, useContext, type ReactNode } from "react";

export type Translate = (
  text: string,
  vars?: Record<string, string | number>,
) => string;

const fill: Translate = (text, vars) =>
  vars
    ? text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, k) =>
        String(vars[k] ?? `{${k}}`),
      )
    : text;

const TextContext = createContext<Translate>(fill);

/**
 * Lets an app translate the design system's built-in copy. Components call
 * `useText()` and pass English text as the key; without a provider the
 * English text is shown.
 */
export function TextProvider({
  t,
  children,
}: {
  t: Translate;
  children: ReactNode;
}) {
  return <TextContext.Provider value={t}>{children}</TextContext.Provider>;
}

export const useText = () => useContext(TextContext);
