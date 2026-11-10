import { createHash, timingSafeEqual } from "node:crypto";
import { SOURCE_CATALOG as english } from "@/lib/locales/source";

export const runtime = "nodejs";
export const maxDuration = 120;

function response(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function secureEqual(actual: string, expected: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(actual).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

function placeholders(value: string): string {
  return [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort()
    .join("|");
}

async function boundedText(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<string> {
  if (!stream) throw new Error("Empty body");
  const reader = stream.getReader();
  const parts: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new Error("Body too large");
      parts.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return Buffer.concat(parts).toString("utf8");
}

/** Optional maintenance endpoint. The application never calls this from a browser. */
export async function POST(request: Request): Promise<Response> {
  const token = process.env.ROOMPAIR_TRANSLATION_ADMIN_TOKEN;
  const webhook = process.env.N8N_TRANSLATION_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_TRANSLATION_WEBHOOK_SECRET;
  if (!token || token.length < 32 || !webhook || !webhookSecret) {
    return response(
      { error: "Translation automation is not configured." },
      503,
    );
  }
  const supplied = request.headers.get("x-roompair-admin-token") ?? "";
  if (supplied.length > 256 || !secureEqual(supplied, token)) {
    return response({ error: "Unauthorized." }, 401);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return response({ error: "Use application/json." }, 415);
  }
  let locale: string;
  try {
    const body = JSON.parse(await boundedText(request.body, 2048)) as Record<
      string,
      unknown
    >;
    if (!body || typeof body !== "object" || typeof body.locale !== "string")
      throw new Error();
    locale = body.locale.toLowerCase();
    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,3}$/.test(locale)) throw new Error();
    Intl.getCanonicalLocales(locale);
  } catch {
    return response(
      { error: 'Provide a valid locale, for example {"locale":"lv"}.' },
      400,
    );
  }
  let destination: URL;
  try {
    destination = new URL(webhook);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(
      destination.hostname,
    );
    if (
      destination.username ||
      destination.password ||
      destination.hash ||
      (destination.protocol !== "https:" &&
        !(local && destination.protocol === "http:"))
    )
      throw new Error();
  } catch {
    return response({ error: "Invalid server webhook configuration." }, 503);
  }
  try {
    const upstream = await fetch(destination, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(90_000),
      headers: {
        "Content-Type": "application/json",
        "X-RoomPair-Webhook-Secret": webhookSecret,
      },
      body: JSON.stringify({
        sourceLocale: "en",
        targetLocale: locale,
        catalog: english,
      }),
    });
    if (!upstream.ok)
      return response(
        { error: "The translation workflow did not complete." },
        502,
      );
    const payload: unknown = JSON.parse(
      await boundedText(upstream.body, 1_000_000),
    );
    if (
      !payload ||
      typeof payload !== "object" ||
      !("catalog" in payload) ||
      !("locale" in payload) ||
      payload.locale !== locale
    )
      throw new Error("Invalid response");
    const catalog = payload.catalog as Record<string, unknown>;
    if (
      !catalog ||
      typeof catalog !== "object" ||
      Array.isArray(catalog) ||
      Object.keys(catalog).length !== Object.keys(english).length
    )
      throw new Error("Invalid catalog");
    for (const [key, source] of Object.entries(english)) {
      const value = Object.hasOwn(catalog, key) ? catalog[key] : undefined;
      if (
        typeof value !== "string" ||
        !value.trim() ||
        value.length > 2000 ||
        placeholders(value) !== placeholders(source)
      )
        throw new Error("Invalid translation");
    }
    return response({ locale, catalog });
  } catch {
    return response(
      {
        error:
          "Translation failed validation or timed out. No catalog was changed.",
      },
      502,
    );
  }
}
