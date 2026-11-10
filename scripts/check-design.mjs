#!/usr/bin/env node
/**
 * Design-system guard.
 *
 * 1. Ratchet on hardcoded values in CSS: hex/rgb/hsl colors, px font sizes,
 *    px border radii. Counts per file are stored in design-baseline.json.
 *    A count may go down (migration progress) but never up, and any CSS file
 *    not in the baseline must have zero.
 * 2. WCAG contrast check for the text/background token pairs in tokens.css.
 *
 *   npm run check:design            check
 *   npm run check:design -- --update rewrite the baseline after a cleanup
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const tokensFile = "src/design-system/tokens.css";
/** Theme files override semantic tokens; they are token files too. */
const themesDir = "src/design-system/themes";
const languagesDir = "src/design-system/languages";
/** themes/*.css and each language's theme.css / palette-*.css */
const isTokenFile = (rel) =>
  rel === tokensFile ||
  rel.startsWith(themesDir + "/") ||
  (rel.startsWith(languagesDir + "/") &&
    /\/(theme|palette-[\w-]+)\.css$/.test(rel));
const baselineFile = join(root, "design-baseline.json");
const update = process.argv.includes("--update");

const rules = {
  color: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g,
  fontSize: /font-size:\s*[\d.]+px/g,
  radius: /border-radius:\s*[\d.]+px/g,
};

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? walk(path)
      : path.endsWith(".css")
        ? [path]
        : [];
  });
}

const counts = {};
for (const file of walk(join(root, "src"))) {
  const rel = relative(root, file);
  if (isTokenFile(rel)) continue;
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const entry = {};
  for (const [rule, re] of Object.entries(rules))
    entry[rule] = (css.match(re) ?? []).length;
  counts[rel] = entry;
}

const total = (map) =>
  Object.values(map).reduce((sum, e) => {
    for (const k of Object.keys(rules)) sum[k] = (sum[k] ?? 0) + (e[k] ?? 0);
    return sum;
  }, {});

let failed = false;

if (update || !existsSync(baselineFile)) {
  const kept = Object.fromEntries(
    Object.entries(counts).filter(([, e]) =>
      Object.values(e).some((n) => n > 0),
    ),
  );
  writeFileSync(baselineFile, JSON.stringify(kept, null, 2) + "\n");
  console.log("Baseline written:", total(kept));
} else {
  const baseline = JSON.parse(readFileSync(baselineFile, "utf8"));
  for (const [file, entry] of Object.entries(counts)) {
    const allowed = baseline[file] ?? {};
    for (const rule of Object.keys(rules)) {
      const now = entry[rule],
        max = allowed[rule] ?? 0;
      if (now > max) {
        failed = true;
        console.error(
          `✗ ${file}: ${now} hardcoded ${rule} value(s), allowed ${max}. Use a token from ${tokensFile}.`,
        );
      } else if (now < max) {
        console.log(
          `↓ ${file}: ${rule} ${max} → ${now}. Run with --update to lock in the progress.`,
        );
      }
    }
  }
  const t = total(counts);
  console.log(
    `Hardcoded values remaining — colors: ${t.color}, font sizes: ${t.fontSize}, radii: ${t.radius}`,
  );
}

/* ── Contrast: base tokens, then each theme's overrides on top ── */
const parseVars = (css) =>
  Object.fromEntries(
    [
      ...css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .matchAll(/(--[\w-]+):\s*([^;]+);/g),
    ].map((m) => [m[1], m[2].trim()]),
  );
const base = parseVars(readFileSync(join(root, tokensFile), "utf8"));
const themes = [["tokens.css", base]];
const themeFiles = walk(join(root, "src/design-system"))
  .map((f) => relative(root, f))
  .filter((rel) => rel !== tokensFile && isTokenFile(rel))
  .sort();
/** Rule blocks of a CSS file, split by whether they are a dark-mode block. */
const splitModes = (css) => {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const light = [];
  const dark = [];
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    (/data-theme="dark"/.test(m[1]) ? dark : light).push(m[2]);
  return { light: parseVars(light.join(";")), dark: parseVars(dark.join(";")) };
};
for (const rel of themeFiles) {
  const css = readFileSync(join(root, rel), "utf8");
  const { light: overrides, dark } = splitModes(css);
  // A palette overrides colours on top of its language theme.
  const parent = rel.includes("/palette-")
    ? parseVars(
        readFileSync(
          join(root, rel.replace(/palette-[\w-]+\.css$/, "theme.css")),
          "utf8",
        ),
      )
    : {};
  const name = rel.replace("src/design-system/", "");
  themes.push([name, { ...base, ...parent, ...overrides }]);
  // A dark block is checked as its own theme, on top of the light values.
  if (Object.keys(dark).length)
    themes.push([`${name} (dark)`, { ...base, ...parent, ...overrides, ...dark }]);
}
const resolveIn = (tokens) => {
  const resolve = (value, depth = 0) => {
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    return ref && depth < 10 ? resolve(tokens[ref[1]] ?? "", depth + 1) : value;
  };
  return resolve;
};
const luminance = (hex) => {
  if (!/^#[0-9a-f]{3,8}$/i.test(hex ?? ""))
    throw new Error(`not a hex colour: ${hex}`);
  const n = hex.replace("#", "");
  const full =
    n.length === 3 ? [...n].map((c) => c + c).join("") : n.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [foreground, background, minimum ratio, only when this token is defined]
const pairs = [
  ["--color-text", "--color-bg", 4.5],
  ["--color-text", "--color-surface-sunken", 4.5],
  ["--color-text", "--color-surface-raised", 4.5],
  ["--color-text-muted", "--color-bg", 4.5],
  ["--color-text-muted", "--color-surface-sunken", 4.5],
  ["--color-text-muted", "--color-surface-raised", 4.5],
  ["--color-text-subtle", "--color-bg", 3],
  ["--color-on-primary", "--color-primary", 4.5],
  ["--color-primary", "--color-bg", 4.5],
  ["--color-primary", "--color-primary-soft", 4.5],
  ["--color-accent-strong", "--color-accent-soft", 4.5],
  ["--color-danger", "--color-danger-soft", 4.5],
  ["--color-success", "--color-success-soft", 4.5],
  ["--color-warning", "--color-warning-soft", 4.5],
  // Text on the highlight and accent fills, solid badges, the match screen
  ["--color-on-xp", "--xp", 4.5],
  ["--color-on-accent", "--color-accent", 4.5],
  ["--color-on-inverse", "--color-surface-inverse", 4.5],
  ["--color-on-danger", "--color-danger", 4.5],
  ["--match-fg", "--match-bg", 4.5],
  // Outlines and press shadows must show on the page (themes with ink
  // outlines, i.e. that define --press-color), and so must the focus ring.
  ["--color-border-strong", "--color-bg", 3, "--press-color"],
  ["--press-color", "--color-bg", 3],
  ["--color-focus-ring", "--color-bg", 3],
];
for (const [label, tokens] of themes) {
  const resolve = resolveIn(tokens);
  for (const [fg, bg, min, needs] of pairs) {
    // A pair whose tokens this theme does not define (yet) is skipped.
    if (!tokens[fg] || !tokens[bg] || (needs && !tokens[needs])) continue;
    let r;
    try {
      r = ratio(resolve(tokens[fg]), resolve(tokens[bg]));
    } catch (e) {
      failed = true;
      console.error(`✗ [${label}] ${fg} on ${bg}: ${e.message}`);
      continue;
    }
    if (r < min) {
      failed = true;
      console.error(
        `✗ [${label}] Contrast ${fg} on ${bg}: ${r.toFixed(2)}:1 (needs ${min}:1)`,
      );
    }
  }
}
console.log(
  failed
    ? "Design check failed."
    : `✓ Design check passed (${pairs.length} contrast pairs × ${themes.length} themes OK).`,
);
process.exit(failed ? 1 : 0);
