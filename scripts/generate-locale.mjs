#!/usr/bin/env node
import { readFile, writeFile, mkdir, rename, rm, open } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const english = JSON.parse(
  await readFile(join(root, "src/lib/locales/en.json"), "utf8"),
);
const turkish = JSON.parse(
  await readFile(join(root, "src/lib/locales/tr.json"), "utf8"),
);
const source = Object.fromEntries(
  [...new Set([...Object.keys(english), ...Object.keys(turkish)])].map(
    (key) => [key, english[key] ?? key],
  ),
);
const args = process.argv.slice(2);
const help = `RoomPair locale generator

  npm run translate -- lv "Latviešu"
  npm run translate -- de "Deutsch" --from ./reviewed-de.json
  npm run translate -- --source

Options:
  --from <file>  Import a reviewed JSON dictionary without calling n8n.
  --rtl          Register a right-to-left language.
  --dry-run      Validate the result without changing files.
  --source       Print the authoritative English catalog for translation.
  --help         Show this help.

The n8n mode reads N8N_TRANSLATION_WEBHOOK_URL and
N8N_TRANSLATION_WEBHOOK_SECRET. Values in .env.local are loaded automatically
on Node.js 22+. Existing process environment values take precedence.
No server needs to be running. Never use NEXT_PUBLIC_ for these secrets.`;

function fail(message) {
  throw new Error(message);
}
function placeholders(value) {
  return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort()
    .join("|");
}
function validate(input) {
  const catalog =
    input && typeof input === "object" && "catalog" in input
      ? input.catalog
      : input;
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog))
    fail("Expected a flat JSON dictionary.");
  const keys = Object.keys(source);
  if (Object.keys(catalog).length !== keys.length)
    fail(`Expected exactly ${keys.length} translation keys.`);
  for (const key of keys) {
    const value = Object.hasOwn(catalog, key) ? catalog[key] : undefined;
    if (typeof value !== "string" || !value.trim() || value.length > 2000)
      fail(`Missing or invalid translation: ${key}`);
    if (placeholders(value) !== placeholders(source[key]))
      fail(`Placeholders must remain unchanged: ${key}`);
  }
  return Object.fromEntries(keys.map((key) => [key, catalog[key]]));
}
async function boundedText(response) {
  if (!response.body) fail("The webhook returned an empty body.");
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 256_000) fail("The webhook response exceeded 256 KB.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  if (args.includes("--help") || !args.length) {
    console.log(help);
    return;
  }
  if (args[0] === "--source") {
    console.log(JSON.stringify(source, null, 2));
    return;
  }
  const locale = args[0]?.toLowerCase();
  const nativeName = args[1];
  if (!locale || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,3}$/.test(locale))
    fail("Use a language code such as lv, de, or pt-br.");
  try {
    Intl.getCanonicalLocales(locale);
  } catch {
    fail("Invalid language code.");
  }
  if (["en", "tr"].includes(locale))
    fail("English and Turkish are bundled. Edit src/lib/locales directly.");
  if (!nativeName || nativeName.startsWith("--") || nativeName.length > 80)
    fail("Provide the language's native name as the second argument.");
  let from;
  let dryRun = false;
  let rtl = /^(ar|fa|he|ur|ps|sd|ug|yi)(-|$)/.test(locale);
  for (let index = 2; index < args.length; index++) {
    const flag = args[index];
    if (flag === "--from") {
      from = args[++index];
      if (!from || from.startsWith("--"))
        fail("--from requires a JSON file path.");
    } else if (flag === "--dry-run") dryRun = true;
    else if (flag === "--rtl") rtl = true;
    else fail(`Unknown option: ${flag}`);
  }

  let payload;
  if (from) {
    const text = await readFile(resolve(process.cwd(), from), "utf8");
    if (text.length > 256_000) fail("The source file exceeds 256 KB.");
    payload = JSON.parse(text);
    if (
      payload &&
      typeof payload === "object" &&
      "locale" in payload &&
      payload.locale !== locale
    ) {
      fail("The source file declares a different locale.");
    }
  } else {
    if (typeof process.loadEnvFile === "function") {
      try {
        process.loadEnvFile(join(root, ".env.local"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    const webhook = process.env.N8N_TRANSLATION_WEBHOOK_URL;
    const secret = process.env.N8N_TRANSLATION_WEBHOOK_SECRET;
    if (!webhook || !secret)
      fail(
        "Configure N8N_TRANSLATION_WEBHOOK_URL and N8N_TRANSLATION_WEBHOOK_SECRET in .env.local, or use --from.",
      );
    let url;
    try {
      url = new URL(webhook);
    } catch {
      fail("N8N_TRANSLATION_WEBHOOK_URL is not a valid URL.");
    }
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      url.username ||
      url.password ||
      url.hash ||
      (url.protocol !== "https:" && !(local && url.protocol === "http:"))
    ) {
      fail(
        "Use HTTPS for the webhook, or HTTP on localhost. URLs must not include credentials or fragments.",
      );
    }
    console.log(
      `Requesting ${locale} translations for ${Object.keys(source).length} strings…`,
    );
    const response = await fetch(url, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(100_000),
      headers: {
        "Content-Type": "application/json",
        "X-RoomPair-Webhook-Secret": secret,
      },
      body: JSON.stringify({
        sourceLocale: "en",
        targetLocale: locale,
        catalog: source,
      }),
    });
    if (!response.ok)
      fail(
        `n8n returned HTTP ${response.status}. Check the workflow execution and credentials in n8n.`,
      );
    payload = JSON.parse(await boundedText(response));
    if (!payload || payload.locale !== locale)
      fail("The webhook returned the wrong locale.");
  }
  const catalog = validate(payload);
  if (dryRun) {
    console.log(
      `Validated ${Object.keys(catalog).length} strings for ${locale}. No files changed.`,
    );
    return;
  }

  const output = join(root, "public/locales");
  await mkdir(output, { recursive: true });
  const lockPath = join(output, ".translation.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST")
      fail(
        "Another locale import is running. If a previous import crashed, remove public/locales/.translation.lock.",
      );
    throw error;
  }
  const manifestPath = join(output, "manifest.json");
  const dictionaryPath = join(output, `${locale}.json`);
  const dictionaryTemp = `${dictionaryPath}.${process.pid}.tmp`;
  const manifestTemp = `${manifestPath}.${process.pid}.tmp`;
  try {
    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      manifest = {
        locales: [
          { code: "en", label: "English", nativeName: "English", dir: "ltr" },
          { code: "tr", label: "Türkçe", nativeName: "Türkçe", dir: "ltr" },
        ],
      };
    }
    if (!Array.isArray(manifest.locales))
      fail("public/locales/manifest.json must contain a locales array.");
    const entry = {
      code: locale,
      label: nativeName,
      nativeName,
      dir: rtl ? "rtl" : "ltr",
    };
    manifest.locales = [
      ...manifest.locales.filter((item) => item.code !== locale),
      entry,
    ];
    await writeFile(
      dictionaryTemp,
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      manifestTemp,
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
    // Publish the dictionary before making it selectable in the manifest.
    await rename(dictionaryTemp, dictionaryPath);
    await rename(manifestTemp, manifestPath);
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
    await rm(dictionaryTemp, { force: true });
    await rm(manifestTemp, { force: true });
  }
  console.log(
    `Saved public/locales/${locale}.json and registered ${nativeName}. Refresh RoomPair to select it.`,
  );
  console.log(
    "Review the wording and layout with a fluent speaker before presenting this language.",
  );
}

main().catch((error) => {
  console.error(
    `Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
  process.exitCode = 1;
});
