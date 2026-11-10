import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import english from "./locales/en.json";
import turkish from "./locales/tr.json";
import { validateCatalog } from "./i18n";
import { englishText, getCompatibility } from "./matching";
import { defaultPreferences, profiles } from "./data";

const en: Record<string, string> = english;
const tr: Record<string, string> = turkish;
const tokens = (value: string) =>
  [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort()
    .join("|");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory())
      return entry.name === "locales" ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")
      ? [path]
      : [];
  });
}
const source = sourceFiles(join(import.meta.dirname, ".."))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
/** Keys built at runtime, e.g. t(`fit.sleep.${value}`). */
const dynamicPrefixes = ["fit.sleep."];
const isUsed = (key: string) =>
  dynamicPrefixes.some((prefix) => key.startsWith(prefix)) ||
  source.includes(JSON.stringify(key)) ||
  source.includes(`"${key}"`);

test("Turkish has exactly the English keys, with real translations and the same tokens", () => {
  assert.deepEqual(Object.keys(tr).sort(), Object.keys(en).sort());
  for (const [key, value] of Object.entries(en)) {
    assert.ok(tr[key].trim(), `empty translation: ${key}`);
    assert.equal(tokens(tr[key]), tokens(value), `tokens differ: ${key}`);
  }
});

test("every catalog key is referenced by the application source", () => {
  assert.deepEqual(
    Object.keys(en).filter((key) => !isUsed(key)),
    [],
  );
});

test('every literal t("…") key in the source exists in the catalog', () => {
  const missing = [...source.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)+)"/g)]
    .map((match) => JSON.parse(`"${match[1]}"`) as string)
    .filter((key) => !Object.hasOwn(en, key));
  assert.deepEqual([...new Set(missing)], []);
});

test("external catalogs keep valid entries and drop malformed ones", () => {
  assert.equal(validateCatalog(null), null);
  assert.equal(validateCatalog(["nav.discover"]), null);
  assert.equal(validateCatalog({ unknown: "value" }), null);
  const catalog = validateCatalog({
    "nav.discover": "Atklāt",
    "nav.likes": "   ",
    "ob.months": "mēneši without the token",
    "ob.progress": "{current}. solis no {total}",
    __proto__: "ignored",
  });
  assert.deepEqual(catalog && { ...catalog }, {
    "nav.discover": "Atklāt",
    "ob.progress": "{current}. solis no {total}",
  });
});

test("compatibility explanations follow the translator they are given", () => {
  const turkishText = (key: string, vars?: Record<string, string | number>) =>
    englishText(key, vars) === en[key] || !tr[key]
      ? (tr[key] ?? key)
      : tr[key].replace(/\{(\w+)\}/g, (token, name: string) =>
          vars && Object.hasOwn(vars, name) ? String(vars[name]) : token,
        );
  const inEnglish = getCompatibility(profiles[0], defaultPreferences);
  const inTurkish = getCompatibility(
    profiles[0],
    defaultPreferences,
    turkishText,
  );
  assert.equal(inTurkish.score, inEnglish.score);
  assert.equal(inTurkish.breakdown[0].label, "Bütçe");
  assert.ok(inTurkish.reasons[0].includes("€420"));
  assert.ok(
    [...inTurkish.reasons, ...inTurkish.breakdown.map((item) => item.detail)]
      .join(" ")
      .match(/\{[a-z]+\}/) === null,
  );
});
