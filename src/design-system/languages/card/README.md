# F · Card

Everyone as a game character card: age, stats, skills, quests.

Live reference: `/design-system?lang=card`. Discover screen in both layouts: `/directions#card-blocks`, `/directions#card-tabs`.

## Principles

|             |                                                                                         |
| ----------- | --------------------------------------------------------------------------------------- |
| **Layout**  | A card framed in its type colour; you-vs-them stats below and the room as an item card. |
| **Type**    | Rubik: rounded and bold, yet readable at full size.                                     |
| **Shape**   | Soft 3D: quiet outlines with a thicker bottom edge, pressable buttons, stat pips.       |
| **Motion**  | Playful and bouncy; buttons sink when pressed.                                          |
| **Details** | Fit is a % score; match reasons are completed quests, things to discuss are open ones.  |

## Rules

- The Discover swipe card (`DiscoverCard`, `swipe.module.css`) is a photo that fills the card. With several photos, thin bars sit at the top and a tap on the right or left half steps through them (room photos first for room seekers, then the person's); a drag still swipes. The first photo is the room when the viewer is looking for a room (rent at the top, host's face, name, fit and move-in at the bottom), the person when the viewer has a room (name, age, fit, budget). Details sit under the card, reached by scrolling; round icon buttons overlap the card's bottom edge.

- The card front shows the person only: age, type, class, stats. Rent and dates are Home.
- Under the card, each tab (Room, the person, Fit) is a column of `DetailSection`s from the design system, all the same shape: a small label with an icon, then one kind of content. Short facts are `FactChips`, who someone is goes in `FactRows`, an answer in their own words is a `PullQuote`, a description is plain text, and photos sit between sections as `DetailPhoto`. Do not nest boxes inside a section or invent a new shape for one tab.
- A profile opened on its own (from a conversation or a like) starts with `DetailHero`: the photo, large, with the name and one line on it, and the options button on the photo. Opened from that person's conversation it has no Message button.
- An open conversation on a phone is a focused page: the top bar shows the person (`TopBar` `person`: photo, name, fit and area; pressing it opens their profile) and the tab bar is hidden (`AppShell` `focused`). The time is shown once under a run of messages from one person, and a new day gets its own line.
- "You vs them" lives in Fit only: matching things are green chips, differing ones amber.
- Frame colour encodes type: `--type-host` (has a room), `--type-explorer` (looking together).
- Soft 3D: outlines and the thick bottom edge of anything pressable use `--soft-edge`, a quiet tone mixed from the palette's ink and the page. Nothing is outlined in ink. In component and app styles write `var(--surface-border, …)` or `var(--control-border, …)`, never `--color-border-strong` directly.
- Buttons press down by `--press-depth` and lose their `--press-shadow`; keep that on every pressable.
- Inputs sit slightly into the page (`--field-bg`) and turn white with a primary outline while typed in. A selected chip or answer is tinted with a primary outline, not filled.
- Filled buttons (primary, Like, Team up) sit on a darker tone of their own colour (`--control-primary-shadow`).
- The focus ring is for the keyboard only: use `:focus-visible` (or `:has(:focus-visible)` on a wrapper), never `:focus` or `:focus-within`, so a click or a tap does not draw a ring.
- Put every `:hover` rule inside `@media (hover: hover)`; on touch screens a hover style otherwise sticks after a tap.
- Game words stay light (quests, abilities); numbers stay plain: "Age 23", "96% fit", "€420 per month". No levels or XP.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Palettes and light/dark

- Eight colour palettes live in `palette-<id>.css` and are listed in `palettes.ts` (classic first, the default). Each file has a light block, `[data-direction="card"][data-palette="<id>"]`, and a dark block with `[data-theme="dark"]` added. A palette defines colours only; `theme.css` builds the press shadows and the focus ring from `--press-color`, `--color-focus-ring` and `--color-bg`.
- `data-palette` and `data-theme` must sit on the same element as `data-direction`, or component tokens resolve with the wrong values. The app sets them on the AppShell root from Settings (System / Light / Dark; "System" follows the device).
- Tokens with one job each, so dark mode works: `--color-on-image` and `--color-photo-frame` (stay light on photos), `--color-on-xp` / `--color-on-accent` (text on the highlight), `--color-surface-inverse` / `--color-on-inverse` (small solid badges), `--color-on-danger`, `--match-bg` / `--match-fg`. Use these instead of `--color-text-inverse` or `--color-surface-raised` for those jobs.
- `npm run check:design` checks every palette's light and dark block separately, including text on the highlight, badges, the match screen, outlines, press shadows and the focus ring.

## Illustrations

Setup illustrations are stored as layers (`public/images/onboarding/<id>.{base,ink,primary,accent}.webp`, made by `scripts/illustrations/split.py`). The three mask layers are filled with `--art-ink`, `--art-primary` and `--art-accent`, so a drawing follows the palette and the theme. Each palette sets `--art-ink` to its light-theme ink; a palette whose primary equals its ink (Ink) also sets a softer `--art-primary`.

## Files

| File                 | What                                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="card"]`                                                                                                                                              |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)                                                                                                                                                   |
| `components.tsx`     | Signature components                                                                                                                                                                                           |
| `MatchScreen.tsx`    | Full-screen “Team up!” after a mutual like: two cards lock together, a heart and the stamp title pop, then a first message. Use inside `Dialog size="full"`. Styles in `match.module.css`.                     |
| `DeckEnd.tsx`        | Where the swipe card was once the deck is empty: a dashed card slot with the last faces fanned like a hand of cards, real counts and the actions; undo keeps its round button. Styles in `deckend.module.css`. |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                                                                                                                                                               |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components                                                                                                                                          |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token             | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| `--type-host`     | `#17784d`                                                              |
| `--type-explorer` | `#2d62c9`                                                              |
| `--stat-on`       | `#5b3fd6`                                                              |
| `--stat-off`      | `#d9dfeb`                                                              |
| `--xp`            | `#f5a524`                                                              |
| `--press-depth`   | `3px`                                                                  |
| `--press-shadow`  | `0 3px 0` in `--soft-edge`                                             |
| `--icon-stroke`   | `2.5`                                                                  |
| `--ease-page`     | `cubic-bezier(0.3, 1.3, 0.5, 1)` (a small overshoot when a page lands) |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

Icons come from the shared Card icon set (`@/design-system/icons`, see the design-system README); this language only makes their stroke heavier with `--icon-stroke: 2.5` to match the 2px outlines.

## Signature components

| Component | Purpose                                       |
| --------- | --------------------------------------------- |
| `Banner`  | Game-style heading with a pressed icon badge. |
| `Stat`    | Stat pips on the character card.              |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/card";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="card" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="card"`.
