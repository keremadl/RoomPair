#!/usr/bin/env node
/**
 * Finds UI strings that reach t() / useText() and compares them with tr.json.
 *
 *   node scripts/i18n/extract.mjs            JSON report, always exits 0
 *   node scripts/i18n/extract.mjs --check    exits 1 if anything is missing
 *                                            or has broken placeholders
 *   --summary   print only counts and the failing entries (smaller output)
 *   --strict    with --check, also fail on t() calls it could not follow
 *
 * See scripts/i18n/sources.mjs for the exports and hints it relies on.
 */
import { extract } from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const report = await extract();
const {
  summary,
  missing,
  placeholderMismatch,
  unresolved,
  unknownIds,
  staleHints,
} = report;

const output = args.has("--summary")
  ? {
      summary,
      missing,
      placeholderMismatch,
      unresolved,
      unknownIds,
      staleHints,
    }
  : report;
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);

const warn = (msg) => process.stderr.write(`i18n: ${msg}\n`);
if (unresolved.length)
  warn(
    `${unresolved.length} t() call(s) could not be followed; add a hint in scripts/i18n/sources.mjs:\n` +
      unresolved.map((u) => `  ${u.file}:${u.line}  t(${u.expr})`).join("\n"),
  );
if (unknownIds.length)
  warn(
    `ids used in code but missing from en.json: ${unknownIds.map((u) => u.key).join(", ")}`,
  );
if (staleHints.length)
  warn(
    `unused hints in sources.mjs: ${staleHints.map((h) => `${h.file} t(${h.expr})`).join(", ")}`,
  );

if (args.has("--check")) {
  const failed =
    missing.length ||
    placeholderMismatch.length ||
    unknownIds.length ||
    (args.has("--strict") && unresolved.length);
  if (failed) {
    warn(
      `check failed: ${missing.length} missing, ${placeholderMismatch.length} placeholder mismatch(es)` +
        (unknownIds.length ? `, ${unknownIds.length} unknown id(s)` : "") +
        (args.has("--strict") ? `, ${unresolved.length} unresolved` : "") +
        "." +
        (missing.length
          ? " Run `npm run i18n:sync` to translate the missing strings."
          : "") +
        (placeholderMismatch.length
          ? " Fix the placeholders of those tr.json entries by hand."
          : ""),
    );
    process.exitCode = 1;
  } else {
    warn(`check passed: ${summary.uiStrings} UI strings, all translated.`);
  }
}
