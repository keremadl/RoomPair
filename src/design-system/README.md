# RoomPair design system

One shared core and six design languages. Every screen is built from the
tokens and components in this folder. Live reference:
**/design-system** (add `?lang=collage`, `?lang=poster`… to see a language).

## Why this exists

The first UI came out generic, the second copied another app. Both problems
come from styling each screen on its own: the old `globals.css` had **440
different hex colors, 45 font sizes and ~15 border radii**. A design system
makes the decisions once, so screens can only combine them.

## Structure

```
src/design-system/
  tokens.css            ← base tokens: primitives, semantic tokens, component tokens
  index.ts              ← core API: import { Button, ProfileDetails } from "@/design-system"
  components/           ← the core: same code in every language
    Button/ IconButton/ Chip/ Badge/ Avatar/ Card/ Field/ SegmentedControl/
    Typography/ Stack/
    Tabs/               accessible tab list (arrow keys, Home/End)
    SectionHeader/      icon + title (+ summary) for a profile group
    FactGrid/           label/value facts as tiles or rows
    CompareTable/       their habits, yours, and whether they work together
    ScoreBars/          score bars + ReasonList
    ProfileDetails/     Home → Person → Fit as blocks or tabs
    SwipeCard/          draggable card (SwipeHero) + Reveal
  languages/            ← the six design languages
    index.ts            registry: metadata, screens, signature components
    fonts.ts            Google fonts the languages use
    chat/ collage/ poster/ day/ plan/ card/
      theme.css         token values for [data-direction="<id>"]
      components.tsx    signature components
      DiscoverScreen.tsx
      README.md         principles, rules, tokens, components
  themes/wire.css       ← neutral wireframe theme for layout prototypes
src/lib/discover/       ← deck state (useDeck) and the Home / Person / Fit content model
src/app/design-system/  ← library environment: everything above, live, in any language
src/app/directions/     ← the six Discover screens side by side, blocks or tabs
scripts/check-design.mjs ← guard: ratchet + contrast check for every theme
```

## Core and languages

The core components never hard-code a look. They read **semantic tokens**
(colour, type, radius, shadow) and **component tokens** (`--control-border-width`,
`--control-border`, `--control-shadow`, `--control-press`, `--heading-weight`,
`--surface-border`…). Each language sets those tokens in its `theme.css`, so
the same `<Button>` is outlined with a hard shadow in Collage, square in Poster and
pressable in Card. A language adds **signature components** only for what the
core cannot express (chat bubbles, polaroids, floor plans, stat pips…).

Every profile uses the same content model (`src/lib/discover/sections.ts`) and
the same `ProfileDetails` arrangement: **Home → Person → Fit**, as blocks or
tabs. Facts about the place never appear under Person, facts about the person
never under Home.

| Language       | Package             | Idea                                               |
| -------------- | ------------------- | -------------------------------------------------- |
| A · Chat       | `languages/chat`    | The profile as a first chat with a future flatmate |
| B · Collage    | `languages/collage` | Polaroids and stickers; four palettes              |
| C · Poster     | `languages/poster`  | Flat colour bands and huge numbers                 |
| D · Day        | `languages/day`     | A day you would share, on a timeline               |
| E · Floor plan | `languages/plan`    | The home as an architect's drawing                 |
| F · Card       | `languages/card`    | Each person as a character card                    |

## Tokens: two layers

| Layer     | Example                                                    | Who uses it              |
| --------- | ---------------------------------------------------------- | ------------------------ |
| Primitive | `--rp-green-700`, `--rp-coral-400`                         | Only `tokens.css` itself |
| Semantic  | `--color-primary`, `--text-md`, `--space-4`, `--radius-lg` | Components and screens   |

To change the look of the entire app (new brand color, new font, rounder
corners), edit **only `tokens.css`**. Because screens reference semantic
names, a re-brand is a one-file change.

Current values are a **starting point** extracted from the existing green /
terracotta palette. Replace them freely once the team agrees on a direction —
the showcase page updates instantly.

## Rules

1. **No raw values outside `tokens.css`.** No hex/rgb colors, no `px` font
   sizes, no `px` radii. Use `var(--color-…)`, `var(--text-…)`,
   `var(--radius-…)`. `npm run check:design` fails if the count goes up.
2. **Components before CSS.** Need a button? `<Button>`. Need a variant that
   doesn't exist? Add the variant to the component and the showcase — don't
   style a one-off in a screen.
3. **12px is the minimum font size.** Body text is 16px (`--text-md`).
4. **Accessible by default.** Icon-only buttons require `label`; inputs
   require `label`; text tokens are contrast-checked by the guard.
5. **One accent.** Terracotta (`--color-accent`) is for small highlights, not
   large surfaces. Green is the primary action color.
6. **No copying other apps.** Research references (see
   `docs/interface-research.md`) inform _patterns_, never colors, layouts or
   assets taken one-to-one.

## Adding a component

**Core** (needed by more than one language):

1. Create `components/Name/Name.tsx` + `Name.module.css`. Tokens only; read
   colour-valued component tokens with a fallback,
   `var(--control-border, var(--color-border-strong))`.
2. Export it from `index.ts`.
3. Add a specimen to `src/app/design-system/showcase.tsx` and check it in all
   six languages (`?lang=…`).

**Signature** (one language only):

1. Add it to `languages/<id>/components.tsx`, styled in `styles.module.css`.
2. List it in `signatures` in `languages/index.ts` and in the language README.

**A new language:** copy a language folder, set its tokens in `theme.css`,
register it in `languages/index.ts` (metadata, screen, signatures) and add
its fonts to `fonts.ts`.

Always finish with `npm run typecheck && npm run check:design`.

## The app

The main app (`src/components/app/`) is built only from this folder. The
top-right **Design** menu sets `data-direction` / `data-palette` on the app
root and picks the profile layout, so every screen switches language at once.
