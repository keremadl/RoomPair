# RoomPair

**Good people. Better living.** A local, presentation-ready roommate matching app built with Next.js, React and TypeScript. Designed around students moving to Riga, with a responsive desktop workspace and a touch-friendly mobile experience.

## Run it

Use Node.js 22 or newer. From this folder:

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. Editing a component or stylesheet updates the preview immediately. No account, database, API key, or n8n instance is needed for the demo. All photos and fonts are stored locally.

For a production build:

```bash
npm run build
npm start
```

## A three-minute jury walkthrough

1. **Discover:** show Ella's photo, housing intent, rent and move-in date. Open **See why you fit** to explain the calculated 96% lifestyle fit.
2. **Filters:** change the budget or choose a city outside the Riga demo. The app respects the requirements and shows an honest empty state.
3. **Like Ella:** swipe right, use the heart, or press the right arrow. Ella already likes the demo user, so a mutual-match screen appears.
4. **Say a little hello:** send a message or choose a conversation starter. The demo generates a clearly labeled simulated reply.
5. **Find a room → Save:** open an interior, save it, then open **My space**. Compare saved homes, tick household discussion points, write a note, and schedule a viewing.
6. **My profile:** edit your living style with the four-step onboarding. Select **I have a room** to discover people seeking one. Switch to Turkish from the language picker.
7. **Demo settings & data → Reset:** return to the original presentation state.

The app opens directly in discovery for a strong first impression. Onboarding is available from **Find your living style** and **Edit my profile**. A completed profile remains on this browser after refresh.

## What works

- Pointer/touch swiping, keyboard arrows, photo paging, profile details and undo.
- Received and sent likes, mutual matches, conversation list, starter prompts, message sending and simulated replies.
- Two search intentions: find a room/search together, or fill an available room.
- Explainable filtering and ranking, preferences, honest empty states.
- Saved rooms, moving checklist, notes, viewing plan, profile setup.
- Local blocking/report recording and a resettable demo state.
- English/Turkish UI, persistent language selection and extensible locale catalogs.
- Responsive layouts, focus-managed dialogs, accessible form labels, reduced-motion preference, local imagery and install metadata.
- Baseline hardening: a same-origin Content Security Policy and standard security headers (`next.config.ts`), and validation of browser-stored state before use (`src/lib/store.ts`).

## Matching rules

`src/lib/matching.ts` is deliberately understandable. It checks city, budget overlap, the actual room price, compatible search intent, move-in dates within 45 days, smoking/pet must-haves, active-search status and the optional student badge filter **before** ranking.

Eligible profiles receive a weighted comparison: budget 25%, tidiness 20%, sleep 15%, social energy 15%, moving date 15%, and stay length 10%. The result includes reasons, differences to discuss, and the exact score components. Age, nationality, popularity and likes do not influence ranking. The percentage is a rule-based comparison of stated preferences, **not a proven probability of successful cohabitation**.

## Editing guide

| File                                               | Purpose                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `src/components/roompair.tsx`                      | Providers and the app frame: sidebar, top bar, navigation, toast      |
| `src/components/app/controller.tsx`                | Interface state and actions shared by every page (`useApp()`)         |
| `src/components/views/*.tsx`                       | One file per page: discover, likes, messages, my space, profile       |
| `src/components/dialogs/*.tsx`                     | One file per dialog: filters, details, fit, match, room, help, report |
| `src/components/shared.tsx`                        | Page heading and room card used by several pages                      |
| `src/components/swipe-surface.tsx`                 | Independent card motion and swipe thresholds                          |
| `src/components/onboarding.tsx` / `onboarding.css` | Four-step setup and custom SVG room illustration                      |
| `src/components/ui.tsx`                            | Brand, shared illustration, modal and empty-state components          |
| `src/app/globals.css`                              | Colors, type, component styling and responsive breakpoints            |
| `src/lib/data.ts` / `types.ts`                     | Fictional people, homes, messages and data types                      |
| `src/lib/matching.ts`                              | Eligibility and transparent compatibility weights                     |
| `src/lib/store.ts`                                 | Browser-local demo state                                              |
| `src/lib/locales/en.json` / `tr.json`              | Interface copy                                                        |
| `public/images` / `public/fonts`                   | Local assets                                                          |

## Languages and n8n

The application runs independently of automation. Import `n8n/translation-workflow.json` into your own n8n instance, configure credentials, and run a translation job only when adding a language:

```bash
npm run translate -- lv "Latviešu"
```

The CLI validates the result and adds a static language pack. Switching languages never calls a paid service. Credentials remain server-side. The workflow is supplied inactive; it has not been connected to a live n8n account. See [the complete setup guide](docs/localization.md).

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm test` runs the unit tests: matching rules, stored-state validation, translation catalogs and the translation endpoint. `npm run test:e2e` drives the app in a browser, including the Turkish interface. It uses installed Chrome/Edge on Windows; elsewhere run `npx playwright install chromium` once, or set `PLAYWRIGHT_CHROMIUM_PATH` to an existing Chromium binary. It starts the dev server automatically, or uses an existing server on port 3000.

The same checks run on every pull request through GitHub Actions (`.github/workflows/ci.yml`).

## Research and honest demo limits

The design study covers Tinder, Bumble, Hinge, Feeld, happn, RoomSync, Diggz and Badi using official pages and public app screenshots. See [research and design decisions](docs/interface-research.md) and [asset sources](docs/assets.md).

All people, properties, chat replies and student verification statuses are fictional presentation data. Stock photos do not depict actual users or available Riga rentals. No authentication, real-time multi-user messaging, identity verification, property verification, moderation delivery, rental booking or shared cloud storage is connected. Reports, notes, likes and messages stay in this browser's local storage. The shared-space design demonstrates the product flow; it does not synchronize between users. No site has been published.

For a real pilot, the next architectural step is authenticated server persistence and real-time messaging, followed by moderation and verification providers. The typed data model, matching engine and UI catalogs are separated so those services can replace the demo layer without redesigning the interface.
