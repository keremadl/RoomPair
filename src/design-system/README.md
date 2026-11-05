# RoomPair design system

One visual language for the whole app. Every screen is built from the tokens
and components in this folder. Live reference: **http://localhost:3000/design-system**.

## Why this exists

The first UI came out generic, the second copied another app. Both problems
come from styling each screen on its own: the old `globals.css` had **440
different hex colors, 45 font sizes and ~15 border radii**. A design system
makes the decisions once, so screens can only combine them.

## Structure

```
src/design-system/
  tokens.css          ← all visual decisions (color, type, space, radius, shadow, motion)
  index.ts            ← public API: import { Button } from "@/design-system"
  cx.ts               ← className helper
  components/
    Button/           Button.tsx + Button.module.css
    IconButton/
    Badge/            non-interactive label / count / status
    Chip/             selectable tag
    Avatar/           + AvatarGroup
    Card/
    Field/            Input, Textarea (label, hint, error built in)
    SegmentedControl/
    Typography/       Heading, Text, Eyebrow
    Stack/            flex layout with spacing-scale gaps
  themes/             ← candidate design languages (Sohbet, Kolaj + palettes, Afiş): token
                        overrides scoped to [data-direction="…"]; compared at /directions
src/app/design-system/ ← showcase page (tokens + every component)
src/app/directions/   ← the Discover screen in each design language
scripts/check-design.mjs ← guard: ratchet + contrast check
```

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

1. Create `components/Name/Name.tsx` + `Name.module.css` (tokens only).
2. Export it from `index.ts`.
3. Add a specimen to `src/app/design-system/showcase.tsx` showing every
   variant and state.
4. Run `npm run typecheck && npm run check:design`.

## Migrating the existing screens

`globals.css` and `onboarding.css` still contain the old hardcoded styles.
Their legacy variables (`--green`, `--ink`, …) are already aliased to the new
tokens, so the app is connected to the system today. Migrate screen by screen:

1. Replace hand-rolled elements (`.button.primary`, `.icon-button`,
   `.segmented`, `.ob-input`…) with design-system components.
2. Replace remaining literals with tokens.
3. Delete CSS that is no longer used.
4. `npm run check:design -- --update` to lock in the lower count.

Suggested order: shared primitives (`ui.tsx` Modal/EmptyState) → onboarding →
messages → likes → my space → discovery card.
