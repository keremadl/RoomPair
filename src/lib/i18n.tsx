"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import english from "./locales/en.json";
import turkish from "./locales/tr.json";
import { SOURCE_CATALOG } from "./locales/source";

export type Dictionary = Record<string, string>;
export type LocaleOption = {
  code: string;
  label: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
};
export const ENGLISH_CATALOG: Dictionary = english;
export const DEFAULT_LOCALES: LocaleOption[] = [
  {
    code: "en",
    label: "English",
    name: "English",
    nativeName: "English",
    dir: "ltr",
  },
  {
    code: "tr",
    label: "Türkçe",
    name: "Türkçe",
    nativeName: "Türkçe",
    dir: "ltr",
  },
];
const BUNDLED: Record<string, Dictionary> = { en: english, tr: turkish };
const STORAGE_KEY = "roompair.locale";
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,3}$/;

function placeholders(value: string): string {
  return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort()
    .join("|");
}

/** Partial catalogs are allowed; missing or malformed translations fall back to English. */
export function validateCatalog(input: unknown): Dictionary | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const candidate = input as Record<string, unknown>;
  const valid: Dictionary = Object.create(null) as Dictionary;
  for (const [key, source] of Object.entries(SOURCE_CATALOG)) {
    const value = Object.hasOwn(candidate, key) ? candidate[key] : undefined;
    if (
      typeof value === "string" &&
      value.trim() &&
      value.length <= 2000 &&
      placeholders(value) === placeholders(source)
    )
      valid[key] = value;
  }
  return Object.keys(valid).length ? valid : null;
}

function readManifest(input: unknown): LocaleOption[] {
  const list = Array.isArray(input)
    ? input
    : input && typeof input === "object" && "locales" in input
      ? input.locales
      : null;
  const result = [...DEFAULT_LOCALES];
  if (!Array.isArray(list)) return result;
  for (const entry of list.slice(0, 250)) {
    if (!entry || typeof entry !== "object" || typeof entry.code !== "string")
      continue;
    const code = entry.code.toLowerCase();
    if (
      !LOCALE_PATTERN.test(code) ||
      result.some((locale) => locale.code === code)
    )
      continue;
    const name = entry.nativeName ?? entry.label;
    if (typeof name !== "string" || !name.trim() || name.length > 80) continue;
    result.push({
      code,
      label: name,
      name,
      nativeName: name,
      dir: entry.dir === "rtl" ? "rtl" : "ltr",
    });
  }
  return result;
}

type I18nValue = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (code: string) => void;
  locales: LocaleOption[];
  isLoading: boolean;
  error: string | null;
};
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState("en");
  const [dictionary, setDictionary] = useState<Dictionary>(english);
  const [locales, updateLocales] = useState(DEFAULT_LOCALES);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localeOptions = useRef(DEFAULT_LOCALES);
  const cache = useRef<Record<string, Dictionary>>({ ...BUNDLED });
  const activeRequest = useRef<AbortController | null>(null);
  const generation = useRef(0);

  const setLocale = useCallback((requestedCode: string) => {
    const code = requestedCode.toLowerCase();
    const option = localeOptions.current.find((item) => item.code === code);
    if (!option || !LOCALE_PATTERN.test(code)) return;
    activeRequest.current?.abort();
    const requestGeneration = ++generation.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    setError(null);
    setLoading(!cache.current[code]);

    const load = async () => {
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        let catalog = cache.current[code];
        if (!catalog) {
          const response = await fetch(
            `/locales/${encodeURIComponent(code)}.json`,
            {
              signal: controller.signal,
              credentials: "omit",
              redirect: "error",
            },
          );
          if (!response.ok) throw new Error("Locale unavailable");
          const text = await response.text();
          if (text.length > 256_000) throw new Error("Locale too large");
          const parsed = validateCatalog(JSON.parse(text));
          if (!parsed) throw new Error("Invalid locale");
          catalog = parsed;
          cache.current[code] = parsed;
        }
        if (generation.current !== requestGeneration) return;
        setDictionary(catalog);
        updateLocale(code);
        document.documentElement.lang = code;
        document.documentElement.dir = option.dir;
        try {
          localStorage.setItem(STORAGE_KEY, code);
        } catch {
          /* Storage is optional. */
        }
      } catch {
        if (generation.current === requestGeneration) {
          setError(english["settings.languageError"]);
        }
      } finally {
        window.clearTimeout(timeout);
        if (generation.current === requestGeneration) setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const initialGeneration = generation.current;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* Keep English. */
    }
    if (saved && BUNDLED[saved]) setLocale(saved);
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    void (async () => {
      try {
        const response = await fetch("/locales/manifest.json", {
          signal: controller.signal,
          credentials: "omit",
          redirect: "error",
          cache: "no-cache",
        });
        if (!response.ok) return;
        const text = await response.text();
        if (text.length > 32_000 || !mounted) return;
        const options = readManifest(JSON.parse(text));
        localeOptions.current = options;
        updateLocales(options);
        // A user's click during the manifest request takes priority over stored preferences.
        if (
          saved &&
          !BUNDLED[saved] &&
          generation.current === initialGeneration
        )
          setLocale(saved);
      } catch {
        /* Bundled languages always work offline. */
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
      activeRequest.current?.abort();
      generation.current += 1;
      window.clearTimeout(timeout);
    };
  }, [setLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = Object.hasOwn(dictionary, key)
        ? dictionary[key]
        : Object.hasOwn(english, key)
          ? ENGLISH_CATALOG[key]
          : key;
      return value.replace(
        /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,
        (token, name: string) =>
          vars && Object.hasOwn(vars, name) ? String(vars[name]) : token,
      );
    },
    [dictionary],
  );
  const value = useMemo(
    () => ({ t, locale, setLocale, locales, isLoading, error }),
    [t, locale, setLocale, locales, isLoading, error],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
