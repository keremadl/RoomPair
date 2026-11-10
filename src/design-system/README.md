# RoomPair design system

One shared core and one design language, **F · Card**, chosen by the team
with the **Tabs** layout for profile details. Every screen is built from the
tokens and components in this folder. Live reference: **/design-system**.

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
    SwipeCard/          draggable card (SwipeHero)
    Motion/             PageTransition, Stagger, Reveal (see Motion below)
  languages/            ← the design language
    index.ts            registry: metadata, default language + layout, signature components
    fonts.ts            Rubik, the Card typeface
    card/
      theme.css         token values for [data-direction="card"]
      components.tsx    signature components
      DiscoverScreen.tsx
      README.md         principles, rules, tokens, components
src/lib/discover/       ← deck state (useDeck) and the Home / Person / Fit content model
src/app/design-system/  ← library environment: everything above, live, in any language
scripts/check-design.mjs ← guard: ratchet + contrast check for every theme
```

## Icons

`icons/` is RoomPair's own icon set (Card style), drawn by hand. The whole
app uses it; there is no other icon library. Import from
`@/design-system/icons` (design-system files use `../../icons`).
Specimen: **/design-system#icons**.

- **Grid:** 24×24 viewBox, live area 3–21 (≥2px safe area with the stroke),
  boxes use corner radius 2.5–3, circles r ≈ 8.75.
- **Stroke:** `currentColor`, `fill="none"`, round caps and joins. Width is
  `--icon-stroke` (2.25 base, 2.5 in Card) in grid units, so it scales with
  the icon. Small solid accents are `currentColor` dots only.
- **Size:** `size` prop (default 24, like lucide); any CSS `width`/`height`
  on the `svg` wins, so `.x svg { width: 20px }` and `1em` both work. Tokens:
  `--icon-size-sm|md|lg|xl` (16/20/24/32).
- **A11y:** decorative by default (`aria-hidden`, `focusable="false"`); pass
  `aria-label` and it becomes `role="img"`.
- **Naming:** plain names for what is drawn (`Heart`, `MapPin`), kept from
  the lucide icons the set replaced: `import { Heart } from "@/design-system/icons"`.
  From the root they are namespaced (`import { Icons } from "@/design-system"`,
  `<Icons.Heart />`) because `Text` would clash with Typography.
- **Adding one:** draw it in `icons/icons.tsx` with `createIcon("Name", …)`
  on the grid above (no copied path data from other libraries), check it at
  16, 24 and 32 in the specimen (it appears automatically), then run
  `npm run typecheck && npm run check:design`.

## Motion

Motion is shared, never hand-rolled per screen (`components/Motion`,
specimen: **/design-system#motion**):

- **`PageTransition`** plays when its `transitionKey` changes: `push` (a
  sub-page slides in from the right), `pop` (back), `fade` (another tab, or a
  tab panel; pass `role="tabpanel"` and ids). It moves with a relative
  offset, not a transform, so the fixed chat composer and sticky bars stay
  put, and it never remounts its children.
- **`Stagger`** (`as="ul" | "ol" | "div"`): items rise in one after another
  on mount. Use it for tile grids and row lists.
- **`Reveal`**: a block rises in whenever its `id` changes.
- **Press:** pressables sink with `--control-press` / `--control-shadow-active`
  and animate with `--transition-press`.
- **Tokens:** `--duration-fast|base|slow|page`, `--ease-standard|exit|page`,
  `--motion-distance-page|rise`, `--stagger-step`, `--stagger-max`.
  `prefers-reduced-motion` sets the durations and the stagger step to 0;
  the app also wraps motion/react in `MotionConfig reducedMotion="user"`.

## Core and languages

The core components never hard-code a look. They read **semantic tokens**
(colour, type, radius, shadow) and **component tokens** (`--control-border-width`,
`--control-border`, `--control-shadow`, `--control-press`, `--heading-weight`,
`--surface-border`…). Each language sets those tokens in its `theme.css`, so
the same `<Button>` is chunky and pressable in Card. A language adds **signature components** only for what the
core cannot express (chat bubbles, polaroids, floor plans, stat pips…).

Every profile uses the same content model (`src/lib/discover/sections.ts`) and
the same `ProfileDetails` arrangement: **Home → Person → Fit**, as blocks or
tabs (the app uses tabs). Facts about the place never appear under Person, facts about the person
never under Home.

The app uses `languages/card` (each person as a character card). The other
five candidate languages (Chat, Collage, Poster, Day, Floor plan) are
archived: see `docs/archive/design-languages.md`.

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

**Core** (generic, not tied to the Card look):

1. Create `components/Name/Name.tsx` + `Name.module.css`. Tokens only; read
   colour-valued component tokens with a fallback,
   `var(--control-border, var(--color-border-strong))`.
2. Export it from `index.ts`.
3. Add a specimen to `src/app/design-system/showcase.tsx` and check it in
   the Card language.

**Signature** (one language only):

1. Add it to `languages/<id>/components.tsx`, styled in `styles.module.css`.
2. List it in `signatures` in `languages/index.ts` and in the language README.

**A new language:** copy a language folder, set its tokens in `theme.css`,
register it in `languages/index.ts` (metadata, screen, signatures) and add
its fonts to `fonts.ts`.

Always finish with `npm run typecheck && npm run check:design`.

## The app

The main app (`src/components/app/`) is built only from this folder. The app
root sets `data-direction="card"` (`defaultLanguage`) and profile details use
`defaultLayout` (tabs), both from `languages/index.ts`.
