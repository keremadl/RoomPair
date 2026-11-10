import english from "./en.json";
import turkish from "./tr.json";

/**
 * Every string the interface can show, in English. Most strings are their own
 * key (`t("Sign in")`); a few older ones use short ids kept in en.json. The
 * Turkish catalog is checked to contain every one of them, so its keys are the
 * full list. Language packs are requested from, and validated against, this.
 */
export const SOURCE_CATALOG: Record<string, string> = Object.fromEntries(
  [...new Set([...Object.keys(english), ...Object.keys(turkish)])].map(
    (key) => [key, (english as Record<string, string>)[key] ?? key],
  ),
);
