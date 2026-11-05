# D · Day

You read the profile as an ordinary day you would share with them.

Live reference: `/design-system?lang=day`. Discover screen in both layouts: `/directions#day-blocks`, `/directions#day-tabs`.

## Principles

|             |                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Layout**  | A photo card with a morning-to-night timeline below, plus a calendar and a budget bar.          |
| **Type**    | Lexend, a typeface designed for reading fluency. Calm and widely spaced.                        |
| **Shape**   | Soft cards; colours carry meaning: morning, noon, evening, night.                               |
| **Motion**  | Gentle; the card tilts slightly and the timeline refreshes with each profile.                   |
| **Details** | Waking up, evenings, tidiness and quiet hours next to your day: 'same' or 'a little different'. |

## Rules

- Time colours mean time: morning, day, evening, night. Never use them as decoration.
- Every timeline `Moment` that compares habits says "Same as you" or "A bit different" in words, not colour alone.
- Dates and money belong to the Home group (`MoveCalendar`, `BudgetBar`); the timeline is Person only.
- Lexend for everything; weights 400–600.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="day"]`      |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token                 | Value     |
| --------------------- | --------- |
| `--time-morning`      | `#f6b26b` |
| `--time-day`          | `#f2d16b` |
| `--time-evening`      | `#e57e5a` |
| `--time-night`        | `#3d42a8` |
| `--time-morning-soft` | `#fdeedd` |
| `--time-day-soft`     | `#fbf3d5` |
| `--time-evening-soft` | `#fbe5dd` |
| `--time-night-soft`   | `#e8e9fb` |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

## Signature components

| Component      | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `GroupTitle`   | Heading with a time-of-day icon chip.                    |
| `Moment`       | One entry on the day timeline, marked same or different. |
| `MoveCalendar` | Month view with their move-in date and yours.            |
| `BudgetBar`    | Rent (or their range) against your budget.               |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/day";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="day" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="day"`.
