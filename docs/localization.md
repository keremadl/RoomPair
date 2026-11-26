# RoomPair localization

RoomPair starts in English and includes Turkish. Language changes stay on the device. The demo works without an n8n instance, an API key, or a translation service.

## Editing the interface

The source catalog is `src/lib/locales/en.json`; Turkish is `src/lib/locales/tr.json`. Use the provider once around the application:

```tsx
import { I18nProvider, useI18n } from "@/lib/i18n";

function LanguagePicker() {
  const { locale, locales, setLocale, t, isLoading, error } = useI18n();
  return (
    <>
      <label htmlFor="language">{t("settings.language")}</label>
      <select
        id="language"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        disabled={isLoading}
      >
        {locales.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
          </option>
        ))}
      </select>
      {error && <p role="status">{error}</p>}
    </>
  );
}
```

`t("discover.left", { count: 12 })` substitutes named variables. Keep tokens such as `{count}` exactly the same in every translation. Unknown keys return the key itself; this also supports `t("Literal English copy")` when its matching catalog entry exists. Prefer named keys for copy that will change. User-written names, bios and conversations are not machine-translated.

English is the fallback for missing or malformed translations. Switching languages cancels older requests, so a slow download cannot overwrite the latest selection. External catalogs are same-origin static JSON files, never executable code. The runtime accepts only known English keys, bounded string lengths and matching interpolation tokens. A failed language download leaves the previous selection intact.

## Add a language with n8n

1. Import `n8n/translation-workflow.json` into your own n8n instance. The template is inactive and requires credentials.
2. On **Receive catalog**, select or create a **Header Auth** credential with name `X-RoomPair-Webhook-Secret` and a long random secret as its value.
3. On **Translate with OpenAI**, select or create a separate **Header Auth** credential with name `Authorization` and value `Bearer YOUR_OPENAI_API_KEY`. Store the real key in n8n's credential manager. The exported template contains placeholder credential IDs only.
4. Review the model in **Validate request**. The template uses `gpt-4.1-mini` with the Responses API and a strict JSON schema. You can change it to an available model that supports these features. This step requires your own API account and incurs API usage when run.
5. Activate/publish the workflow. Copy its production webhook URL, not its test URL.
6. Copy `.env.example` to `.env.local`, then set `N8N_TRANSLATION_WEBHOOK_URL` and `N8N_TRANSLATION_WEBHOOK_SECRET`. They are server/CLI secrets; never add a `NEXT_PUBLIC_` prefix.
7. Generate a locale from the project folder:

```powershell
npm run translate -- lv "Latviešu"
npm run translate -- de "Deutsch"
npm run translate -- ar "العربية" --rtl
```

The CLI loads `.env.local` on Node.js 22 or newer. It calls the fixed configured webhook, checks every translation key and placeholder, writes `public/locales/<code>.json`, and updates `public/locales/manifest.json`. Refresh the app to see the language in its picker. Review generated wording and layouts before presenting it. Region/script tags such as `pt-br` and `zh-hans` are supported.

The flow is **English catalog → authenticated n8n webhook → validated request → translation → validated response → local JSON files**. Only interface copy is transmitted; no demo profiles, chat messages, or personal information enter the workflow. The template requests `store: false` and disables saving execution payloads in n8n; these settings do not replace provider or instance retention policies.

The workflow does not write into your machine. The CLI is the publishing step. Translation API calls happen only when you run it; language switching never makes a paid API call. No external service was connected as part of this demo.

## Add a language without an API

Print the source catalog, translate its values, and import the reviewed result:

```powershell
npm run translate -- --source
npm run translate -- lv "Latviešu" --from ./reviewed-lv.json --dry-run
npm run translate -- lv "Latviešu" --from ./reviewed-lv.json
```

The input can be a flat dictionary or `{ "locale": "lv", "catalog": { ... } }`. Every English key must exist, values must be nonempty strings, and tokens must match. `--dry-run` validates without writing. English and Turkish are bundled; edit their source files directly. After adding new English strings, regenerate other languages. Older external catalogs continue to work with English fallbacks for missing keys.

Each manifest entry has `code`, `label`, `nativeName`, and `dir` (`ltr` or `rtl`). The loader sets the document's `lang` and `dir`. Right-to-left languages still need visual review of the app layout and any physical left/right styles.

## Optional maintenance API

`POST /api/translations` provides the same fixed-webhook translation operation for trusted local tooling. It returns a validated catalog and does not save files. The UI does not call it.

The route is disabled unless all three environment values are set, including a separate `ROOMPAIR_TRANSLATION_ADMIN_TOKEN` of at least 32 characters. Send that token in `X-RoomPair-Admin-Token` and a JSON body such as `{ "locale": "lv" }`. Never expose the token in browser code. The CLI talks directly to n8n and does not require this admin token.

The route uses constant-time token comparison, a bounded request body, a fixed environment-controlled destination, no redirects, a timeout, and strict validation of the result. Remote webhook URLs must use HTTPS; HTTP is allowed only for a localhost n8n instance. In a future public deployment, keep this route private or remove it, and use your authenticated administrative infrastructure for translation jobs.

## Validation and limits

Local validation covers catalog parity, placeholder preservation, CLI imports, workflow Code-node logic, and API authentication/error handling. Browser checks cover English/Turkish switching and persistence, extra manifest languages, English fallback for malformed or missing strings, and keeping the previous language after a failed download.

The workflow accepts up to 1,500 entries and 250,000 source JSON characters, with a 30,000-token output ceiling. These are explicit batch limits, not a guarantee that every language or future catalog fits. Incomplete responses, missing keys, and changed placeholders fail before any local files are changed; the CLI does not silently retry a paid call. If a larger catalog reaches the limit, translate reviewed sections manually, combine them into a complete catalog, and use `--from`, or extend the workflow to process smaller batches before increasing the guards.

Importing and running the template in an actual n8n account still requires the setup above; no live credentials are included. The demo has no automatic translation scheduler, and adding a language does not automatically translate user-generated content.

The integration follows the official [n8n Webhook documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/), [n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/), and [OpenAI Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). The model's supported interfaces are documented on the [GPT-4.1 mini page](https://developers.openai.com/api/docs/models/gpt-4.1-mini).
