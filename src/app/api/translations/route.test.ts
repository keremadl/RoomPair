import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import english from "@/lib/locales/en.json";
import { POST } from "./route";

const TOKEN = "a".repeat(40);
const realFetch = globalThis.fetch;
let upstreamCalls: { url: string; init: RequestInit }[] = [];

function configure(configured = true) {
  if (configured) {
    process.env.ROOMPAIR_TRANSLATION_ADMIN_TOKEN = TOKEN;
    process.env.N8N_TRANSLATION_WEBHOOK_URL = "https://n8n.example/webhook";
    process.env.N8N_TRANSLATION_WEBHOOK_SECRET = "webhook-secret";
  } else {
    delete process.env.ROOMPAIR_TRANSLATION_ADMIN_TOKEN;
    delete process.env.N8N_TRANSLATION_WEBHOOK_URL;
    delete process.env.N8N_TRANSLATION_WEBHOOK_SECRET;
  }
}
function mockUpstream(body: unknown, status = 200) {
  globalThis.fetch = (async (url: URL | string, init: RequestInit) => {
    upstreamCalls.push({ url: String(url), init });
    return Response.json(body, { status });
  }) as typeof fetch;
}
function request(
  body: string,
  headers: Record<string, string> = {
    "content-type": "application/json",
    "x-roompair-admin-token": TOKEN,
  },
) {
  return new Request("http://localhost/api/translations", {
    method: "POST",
    headers,
    body,
  });
}

beforeEach(() => {
  upstreamCalls = [];
  configure();
  mockUpstream({});
});
afterEach(() => {
  globalThis.fetch = realFetch;
  configure(false);
});

test("the endpoint is disabled until all three secrets are configured", async () => {
  configure(false);
  assert.equal((await POST(request('{"locale":"lv"}'))).status, 503);
  configure();
  process.env.ROOMPAIR_TRANSLATION_ADMIN_TOKEN = "too-short";
  assert.equal((await POST(request('{"locale":"lv"}'))).status, 503);
  assert.equal(upstreamCalls.length, 0);
});

test("a missing or wrong admin token is rejected before anything else happens", async () => {
  for (const token of ["", "wrong", TOKEN + "x", "b".repeat(300)]) {
    const response = await POST(
      request('{"locale":"lv"}', {
        "content-type": "application/json",
        "x-roompair-admin-token": token,
      }),
    );
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal(upstreamCalls.length, 0);
});

test("only small JSON bodies with a well-formed locale are accepted", async () => {
  const form = await POST(
    request("locale=lv", {
      "content-type": "text/plain",
      "x-roompair-admin-token": TOKEN,
    }),
  );
  assert.equal(form.status, 415);
  for (const body of [
    "not json",
    "{}",
    '{"locale":5}',
    '{"locale":"../../etc/passwd"}',
    '{"locale":"x"}',
    JSON.stringify({ locale: "lv", padding: "x".repeat(3000) }),
  ])
    assert.equal((await POST(request(body))).status, 400, body);
  assert.equal(upstreamCalls.length, 0);
});

test("an insecure or credentialed webhook URL is refused", async () => {
  for (const url of [
    "http://n8n.example/webhook",
    "https://user:pass@n8n.example/webhook",
    "not a url",
  ]) {
    process.env.N8N_TRANSLATION_WEBHOOK_URL = url;
    assert.equal((await POST(request('{"locale":"lv"}'))).status, 503, url);
  }
  assert.equal(upstreamCalls.length, 0);
});

test("a complete translation is returned and the webhook secret stays server-side", async () => {
  const catalog = Object.fromEntries(
    Object.entries(english).map(([key, value]) => [key, `lv ${value}`]),
  );
  mockUpstream({ locale: "lv", catalog });
  const response = await POST(request('{"locale":"LV"}'));
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.deepEqual(JSON.parse(text), { locale: "lv", catalog });
  assert.ok(!text.includes("webhook-secret"));
  assert.equal(upstreamCalls.length, 1);
  assert.equal(upstreamCalls[0].url, "https://n8n.example/webhook");
  assert.equal(upstreamCalls[0].init.redirect, "error");
  const sent = JSON.parse(String(upstreamCalls[0].init.body));
  assert.equal(sent.targetLocale, "lv");
  assert.deepEqual(sent.catalog, english);
});

test("incomplete, mislabelled or token-breaking translations are rejected", async () => {
  const good = Object.fromEntries(
    Object.entries(english).map(([key, value]) => [key, `lv ${value}`]),
  );
  const { "nav.discover": _dropped, ...missingKey } = good;
  const cases: [unknown, number?][] = [
    [{ locale: "de", catalog: good }],
    [{ locale: "lv", catalog: missingKey }],
    [{ locale: "lv", catalog: { ...good, "ob.months": "no token" } }],
    [{ locale: "lv", catalog: { ...good, "nav.likes": "  " } }],
    [{ locale: "lv", catalog: [] }],
    [{ locale: "lv", catalog: good }, 500],
  ];
  for (const [body, status] of cases) {
    mockUpstream(body, status);
    assert.equal((await POST(request('{"locale":"lv"}'))).status, 502);
  }
});
