# RoomPair

**Good people. Better living.** A local, presentation-ready roommate matching app built with Next.js, React and TypeScript. Designed around students moving to Riga, with a responsive desktop workspace and a touch-friendly mobile experience.

- **Live demo:** https://roompair.vercel.app
- **What RoomPair is and why:** [product concept](docs/product-concept.md)

## Run it

Use Node.js 22 or newer. From this folder:

```powershell
npm install
npm run dev
```

Open **http://localhost:3000**. Editing a component or stylesheet updates the preview immediately. No account, database, API key, or n8n instance is needed for the demo. All photos and fonts are stored locally.

For a production build:

```powershell
npm run build
npm start
```

## A three-minute jury walkthrough

1. **Discover:** show Ella's photo, housing intent, rent and move-in date. Open **See why you fit** to explain the calculated 96% lifestyle fit.
2. **Filters:** change the budget or choose a city outside the Riga demo. The app respects the requirements and shows an honest empty state.
3. **Like Ella:** swipe right, use the heart, or press the right arrow. Ella already likes the demo user, so a mutual-match screen appears.
4. **Say a little hello:** send a message or choose a conversation starter. The demo generates a clearly labeled simulated reply.
5. **Likes:** open **Likes** to see who liked you; tap a tile to see the card and details, then Skip or Team up. A match moves to **Messages**.
6. **My profile:** answer **What are you looking for?** — _I'm looking for a room_ shows hosts with their room first; _I have a room, I need a flatmate_ shows only people looking for a room. Edit your living style, or switch to Turkish.
7. **Demo settings & data → Reset:** return to the original presentation state.

The app opens directly in discovery for a strong first impression. Onboarding is available from **Find your living style** and **Edit my profile**. A completed profile remains on this browser after refresh.

## What works

- Pointer/touch swiping, keyboard arrows, photo paging, profile details and undo.
- Received and sent likes, mutual matches, conversation list, starter prompts, message sending and simulated replies.
- Two search intentions, chosen on My profile: looking for a room (see hosts, room first) or having a room (see room seekers only).
- Explainable filtering and ranking, preferences, honest empty states.
- Likes, matches and chat, profile setup.
- Local blocking/report recording and a resettable demo state.
- English/Turkish UI, persistent language selection and extensible locale catalogs.
- Responsive layouts, focus-managed dialogs, accessible form labels, reduced-motion preference, local imagery and install metadata.

## Matching rules

`src/lib/matching.ts` is deliberately understandable. It checks city, budget overlap, the actual room price, compatible search intent (room seekers only meet hosts, hosts only meet room seekers), move-in dates within 45 days, smoking/pet must-haves, active-search status and the optional student badge filter **before** ranking.

Eligible profiles receive a weighted comparison: budget 25%, tidiness 20%, sleep 15%, social energy 15%, moving date 15%, and stay length 10%. The result includes reasons, differences to discuss, and the exact score components. Age, nationality, popularity and likes do not influence ranking. The percentage is a rule-based comparison of stated preferences, **not a proven probability of successful cohabitation**.

## Editing guide

| File                                             | Purpose                                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `src/components/app/RoomPairApp.tsx`             | App state, navigation, discovery logic, dialogs                                                 |
| `src/components/app/AppShell.tsx`                | Top bar and navigation                                                                          |
| `src/components/app/views/`                      | Discover, Likes, Messages and Profile screens                                                   |
| `src/components/app/dialogs/` / `Onboarding.tsx` | Filters, profile, match, room, report, settings and four-step setup                             |
| `src/design-system/`                             | Tokens, core components and the Card design language — see its README; live at `/design-system` |
| `src/lib/discover/`                              | Home / Person / Fit content model behind the profile tabs                                       |
| `src/lib/data.ts` / `types.ts`                   | Fictional people, homes, messages and data types                                                |
| `src/lib/matching.ts`                            | Eligibility and transparent compatibility weights                                               |
| `src/lib/store.ts`                               | Browser-local demo state                                                                        |
| `src/lib/locales/en.json` / `tr.json`            | Interface copy                                                                                  |
| `public/images` / `public/fonts`                 | Local assets                                                                                    |

## Languages and n8n

The application runs independently of automation. Import `n8n/translation-workflow.json` into your own n8n instance, configure credentials, and run a translation job only when adding a language:

```powershell
npm run translate -- lv "Latviešu"
```

The CLI validates the result and adds a static language pack. Switching languages never calls a paid service. Credentials remain server-side. The workflow is supplied inactive; it has not been connected to a live n8n account. See [the complete setup guide](docs/localization.md).

## Translations (n8n)

`tr.json` is kept complete by a small n8n workflow, `automation/n8n/i18n-sync.workflow.json`: extract the UI strings → if any are missing, translate them → check again → print a report (counts, added keys, anything still missing).

```bash
npm run i18n:check   # fast (<1 s), no n8n: fails if a UI string has no Turkish entry or its {placeholders} differ
npm run i18n:sync    # runs the n8n workflow headless and appends new translations to tr.json
```

- `scripts/i18n/extract.mjs` reads `src/` with the TypeScript parser and finds every string that reaches `t()` (from `useI18n()`) or `useText()`: literals, plus values that arrive through consts, label maps, option arrays, `.map()` callbacks, `profileSteps` and `useState`. Where a value comes in through component props, a hint in `scripts/i18n/sources.mjs` names its source; the extractor lists any `t()` call it cannot follow (`unresolved`). It also reports `unused` tr.json keys, but never deletes them.
- `scripts/i18n/translate.mjs` translates the missing strings with the **logged-in Codex CLI** (`codex exec`, ChatGPT login, no API key), in batches with strict JSON and a short style guide (informal "sen", short UI Turkish). It checks placeholders, `…` and emoji, and appends to `tr.json` in order. If `codex` is missing or logged out, it stops with a clear message.
- `i18n:sync` needs n8n on PATH: `npm i -g n8n@2.35.7` (the newest n8n that runs on Node 22; 2.41+ needs Node 24). When nothing is missing it returns without starting n8n; `npm run i18n:sync -- --force` always runs the workflow. `scripts/i18n/run-n8n.sh` uses a private n8n home (`~/.cache/roompair-n8n`), enables the Execute Command node (`NODES_EXCLUDE=[]`, off by default in n8n 2.x), re-imports the workflow when it changes, and runs it with `n8n execute --id`. The n8n log is in `~/.cache/roompair-n8n/last-run.log`.
- **Open it in the n8n UI:** in n8n, *Workflows → Import from File…* and pick `automation/n8n/i18n-sync.workflow.json` (or `n8n import:workflow --input=automation/n8n/i18n-sync.workflow.json`). Start n8n with `NODES_EXCLUDE=[]` and `ROOMPAIR_DIR=/path/to/RoomPair` set, so the Execute Command nodes are available and run in the repo. After editing it in the UI, export it back to the same file (*Download*) so the CLI run uses your changes.

## Lab (testing without deploying)

`npm run lab` builds `.lab/RoomPair-Lab.html`: the app inside an iPhone 16 Pro frame (402 × 874) and the design-system library, as one self-contained page. It is published as a private claude.ai artifact, so design changes can be tested there before they go to Vercel. Sources: `lab/` (entry, page shell, build script).

## Checks

```powershell
npm run typecheck
npm run check:design
npm test
npm run test:e2e
npm run build
```

The E2E configuration uses installed Chrome/Edge on Windows. On another machine, install Playwright Chromium with `npx playwright install chromium` if needed. It starts the dev server automatically, or uses an existing server on port 3000.

## Research and honest demo limits

The design study covers Tinder, Bumble, Hinge, Feeld, happn, RoomSync, Diggz and Badi using official pages and public app screenshots. See [research and design decisions](docs/interface-research.md) and [asset sources](docs/assets.md).

All people, properties, chat replies and student verification statuses are fictional presentation data. Stock photos do not depict actual users or available Riga rentals. No authentication, real-time multi-user messaging, identity verification, property verification, moderation delivery, rental booking or shared cloud storage is connected. Reports, notes, likes and messages stay in this browser's local storage. The shared-space design demonstrates the product flow; it does not synchronize between users.

For a real pilot, the next architectural step is authenticated server persistence and real-time messaging, followed by moderation and verification providers. The typed data model, matching engine and UI catalogs are separated so those services can replace the demo layer without redesigning the interface.
