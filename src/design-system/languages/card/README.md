# F · Card

Everyone as a game character card: age, stats, skills, quests.

Live reference: `/design-system?lang=card`. Discover screen in both layouts: `/directions#card-blocks`, `/directions#card-tabs`.

## Principles

|             |                                                                                         |
| ----------- | --------------------------------------------------------------------------------------- |
| **Layout**  | A card framed in its type colour; you-vs-them stats below and the room as an item card. |
| **Type**    | Rubik: rounded and bold, yet readable at full size.                                     |
| **Shape**   | Thick outlines, pressable 3D buttons, stat pips and a fit bar.                          |
| **Motion**  | Playful and bouncy; buttons sink when pressed.                                          |
| **Details** | Fit is a % score; match reasons are completed quests, things to discuss are open ones.  |

## Rules

- The Discover swipe card (`DiscoverCard`, `swipe.module.css`) is a photo that fills the card. With several photos, thin bars sit at the top and a tap on the right or left half steps through them (room photos first for room seekers, then the person's); a drag still swipes. The first photo is the room when the viewer is looking for a room (rent at the top, host's face, name, fit and move-in at the bottom), the person when the viewer has a room (name, age, fit, budget). Details sit under the card, reached by scrolling; round icon buttons overlap the card's bottom edge.

- The card front shows the person only: age, type, class, stats. Rent and dates are Home, on the `HomeItem`.
- Frame colour encodes type: `--type-host` (has a room), `--type-explorer` (looking together).
- Buttons press down by `--press-depth` and lose their `--press-shadow`; keep that on every pressable.
- Game words stay light (quests, abilities); numbers stay plain: "Age 23", "96% fit", "€420 per month". No levels or XP.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme.css`          | Semantic and component token values for `[data-direction="card"]`                                                                                                                          |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)                                                                                                                               |
| `components.tsx`     | Signature components                                                                                                                                                                       |
| `MatchScreen.tsx`    | Full-screen “Team up!” after a mutual like: two cards lock together, a heart and the stamp title pop, then a first message. Use inside `Dialog size="full"`. Styles in `match.module.css`. |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                                                                                                                                           |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components                                                                                                                      |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token             | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| `--type-host`     | `#17784d`                                                              |
| `--type-explorer` | `#2d62c9`                                                              |
| `--stat-on`       | `#5b3fd6`                                                              |
| `--stat-off`      | `#d9dfeb`                                                              |
| `--xp`            | `#f5a524`                                                              |
| `--press-depth`   | `4px`                                                                  |
| `--press-shadow`  | `0 4px 0 #1d2240`                                                      |
| `--icon-stroke`   | `2.5`                                                                  |
| `--ease-page`     | `cubic-bezier(0.3, 1.3, 0.5, 1)` (a small overshoot when a page lands) |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

Icons come from the shared Card icon set (`@/design-system/icons`, see the design-system README); this language only makes their stroke heavier with `--icon-stroke: 2.5` to match the 2px outlines.

## Signature components

| Component  | Purpose                                       |
| ---------- | --------------------------------------------- |
| `Banner`   | Game-style heading with a pressed icon badge. |
| `Stat`     | Stat pips on the character card.              |
| `Versus`   | Their stat and yours as two pip rows.         |
| `Trait`    | A trait row, ticked when it works with you.   |
| `HomeItem` | The room as an item card with fact coins.     |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/card";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="card" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="card"`.
