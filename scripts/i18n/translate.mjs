#!/usr/bin/env node
/**
 * Translates the strings extract.mjs reports as missing into Turkish with the
 * logged-in Codex CLI (`codex exec`, ChatGPT login; no API key), validates
 * them and appends them to src/lib/locales/tr.json.
 *
 *   node scripts/i18n/translate.mjs              translate and write
 *   node scripts/i18n/translate.mjs --dry-run    translate, print, do not write
 *   --batch <n>   strings per Codex call (default 40)
 *   CODEX_BIN     path to the codex executable (default: codex on PATH)
 *
 * Prints a JSON summary on stdout. Exits 1 if any string could not be
 * translated, 2 if Codex is not available.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  EN_PATH,
  TR_PATH,
  extract,
  placeholders,
  readJson,
  writeJson,
} from "./lib.mjs";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const batchArg = argv.indexOf("--batch");
const BATCH =
  batchArg >= 0 ? Math.max(1, Number(argv[batchArg + 1]) || 40) : 40;
const TIMEOUT_MS = 180_000;
const CODEX = process.env.CODEX_BIN || "codex";
const log = (msg) => process.stderr.write(`i18n translate: ${msg}\n`);

const STYLE = `You translate short UI strings for RoomPair, a demo app that helps students in Riga find a flatmate or a room.
Style guide for Turkish:
- B1-level, everyday Turkish. Short and natural, like a friendly mobile app.
- Informal "sen" (never "siz"). Imperatives in the "sen" form: "Kaydet", "Dene".
- Keep it concise: a button or chip stays 1-3 words; do not add words or explanations.
- Keep every placeholder like {name} or {count} exactly as written, untranslated, same braces.
- Keep emoji, punctuation, the ellipsis character "…", "·", "%" and "€" as in the source.
- Keep sentence case and the trailing punctuation of the source. Keep ALL CAPS if the source is ALL CAPS.
- Do not translate product names (RoomPair) or place names (Riga, Āgenskalns…).
- Single words such as chips are interests, habits or answers on a profile; pick the natural noun or short phrase.
- Reuse the terminology of the existing translations below.`;

const SCHEMA = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, tr: { type: "string" } },
        required: ["id", "tr"],
        additionalProperties: false,
      },
    },
  },
  required: ["translations"],
  additionalProperties: false,
};

function codexAvailable() {
  const version = spawnSync(CODEX, ["--version"], { encoding: "utf8" });
  if (version.error || version.status !== 0)
    return "the `codex` command was not found. Install the Codex CLI (npm i -g @openai/codex) and run `codex login`.";
  const status = spawnSync(CODEX, ["login", "status"], { encoding: "utf8" });
  if (status.status !== 0)
    return "Codex CLI is not logged in. Run `codex login` (ChatGPT account); no API key is used.";
  return null;
}

/** A few existing pairs so Codex reuses the app's terminology. */
function examples(tr, en) {
  const plain = Object.entries(tr).filter(([k]) => !Object.hasOwn(en, k));
  const short = plain.filter(([k]) => k.length <= 24).slice(0, 30);
  const sentences = plain
    .filter(([k]) => k.length > 24 && k.length < 90)
    .slice(0, 10);
  return [...short, ...sentences].map(([en, t]) => ({ en, tr: t }));
}

/** Pulls the JSON object out of a model reply, tolerating fences or chatter. */
export function parseReply(text) {
  const cleaned = text
    .replace(/^﻿/, "")
    .replace(/```(?:json)?/gi, "")
    .trim();
  const candidates = [cleaned];
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first)
    candidates.push(cleaned.slice(first, last + 1));
  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate);
      const list = Array.isArray(value) ? value : value?.translations;
      if (Array.isArray(list)) return list;
      if (value && typeof value === "object")
        return Object.entries(value).map(([id, tr]) => ({ id, tr }));
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error("Codex did not return JSON.");
}

/** Why a translation is not acceptable, or null if it is. */
export function problem(source, value) {
  if (typeof value !== "string" || !value.trim()) return "empty";
  if (value.length > Math.max(60, source.length * 3)) return "too long";
  if (placeholders(value) !== placeholders(source))
    return `placeholders must be exactly {${placeholders(source).split("|").filter(Boolean).join("}, {")}}`;
  if (source.includes("…") && !value.includes("…"))
    return 'keep the "…" character';
  const emoji = (s) =>
    [...s.matchAll(/\p{Extended_Pictographic}/gu)]
      .map((m) => m[0])
      .sort()
      .join("");
  if (emoji(source) !== emoji(value)) return "keep the same emoji";
  if (/[\u0000-\u001f]/.test(value)) return "control characters";
  return null;
}

function askCodex(items, context, workdir) {
  const prompt = `${STYLE}

Existing translations (English -> Turkish):
${JSON.stringify(context)}

Translate each item's "text" to Turkish. Reply with strict JSON only, no prose, no code fences:
{"translations":[{"id":"<same id>","tr":"<Turkish>"}]}
Return exactly one entry per id.${items.some((i) => i.note) ? "\nSome items have a note from a previous attempt that was rejected; fix that." : ""}

Items:
${JSON.stringify(items)}`;
  const schemaPath = join(workdir, "schema.json");
  const outPath = join(workdir, `reply-${Date.now()}.txt`);
  writeFileSync(schemaPath, JSON.stringify(SCHEMA));
  const run = spawnSync(
    CODEX,
    [
      "exec",
      "--skip-git-repo-check",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--color",
      "never",
      "-C",
      workdir,
      "--output-schema",
      schemaPath,
      "-o",
      outPath,
      "-",
    ],
    {
      input: prompt,
      encoding: "utf8",
      timeout: TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (run.error) throw new Error(`codex exec failed: ${run.error.message}`);
  if (run.status !== 0)
    throw new Error(
      `codex exec exited ${run.status}: ${(run.stderr || run.stdout).trim().split("\n").slice(-5).join(" ")}`,
    );
  let reply = "";
  try {
    reply = readFileSync(outPath, "utf8");
  } catch {
    reply = run.stdout;
  }
  return parseReply(reply);
}

async function main() {
  const report = await extract();
  const missing = report.missing;
  if (!missing.length) {
    process.stdout.write(
      `${JSON.stringify({ added: [], failed: [], message: "Nothing to translate." }, null, 2)}\n`,
    );
    return;
  }
  const unavailable = codexAvailable();
  if (unavailable) {
    log(unavailable);
    process.stdout.write(
      `${JSON.stringify({ added: [], failed: missing.map((m) => m.key), error: unavailable }, null, 2)}\n`,
    );
    process.exitCode = 2;
    return;
  }

  const en = readJson(EN_PATH);
  const tr = readJson(TR_PATH);
  const context = examples(tr, en);
  const workdir = mkdtempSync(join(tmpdir(), "roompair-i18n-"));
  const done = new Map();
  const notes = new Map();
  try {
    let queue = missing.map((m, i) => ({
      id: String(i + 1),
      key: m.key,
      text: m.source,
    }));
    for (let attempt = 1; attempt <= 3 && queue.length; attempt++) {
      const retry = [];
      for (let start = 0; start < queue.length; start += BATCH) {
        const batch = queue.slice(start, start + BATCH);
        log(`attempt ${attempt}: asking Codex for ${batch.length} string(s)…`);
        let reply = [];
        try {
          reply = askCodex(
            batch.map(({ id, text }) => ({
              id,
              text,
              ...(notes.has(id) ? { note: notes.get(id) } : {}),
            })),
            context,
            workdir,
          );
        } catch (error) {
          log(error.message);
        }
        const byId = new Map(
          reply
            .filter((r) => r && typeof r === "object")
            .map((r) => [String(r.id), r.tr]),
        );
        for (const item of batch) {
          const value =
            typeof byId.get(item.id) === "string"
              ? byId.get(item.id).trim()
              : byId.get(item.id);
          const why = problem(item.text, value);
          if (why) {
            notes.set(item.id, `rejected: ${why}`);
            retry.push(item);
          } else done.set(item.key, value);
        }
      }
      queue = retry;
    }
    const failed = queue.map((q) => ({ key: q.key, reason: notes.get(q.id) }));

    // Re-read right before writing; append new keys in the order extract reported them.
    const latest = readJson(TR_PATH);
    const added = [];
    for (const { key } of missing)
      if (
        done.has(key) &&
        !(Object.hasOwn(latest, key) && latest[key]?.trim())
      ) {
        latest[key] = done.get(key);
        added.push({ key, tr: done.get(key) });
      }
    if (!dryRun && added.length) writeJson(TR_PATH, latest);
    process.stdout.write(
      `${JSON.stringify({ added, failed, dryRun }, null, 2)}\n`,
    );
    log(
      `${dryRun ? "would add" : "added"} ${added.length}, failed ${failed.length}`,
    );
    if (failed.length) process.exitCode = 1;
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  // Always answer in JSON so the n8n workflow can report what went wrong.
  log(error.stack ?? String(error));
  process.stdout.write(
    `${JSON.stringify({ added: [], failed: [], error: String(error.message ?? error) }, null, 2)}\n`,
  );
  process.exitCode = 1;
}
