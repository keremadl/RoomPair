# C · Poster

As clear as a gig poster: flat colour bands, huge numbers, readable at a glance.

Live reference: `/design-system?lang=poster`. Discover screen in both layouts: `/directions#poster-blocks`, `/directions#poster-tabs`.

## Principles

|             |                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Layout**  | A square photo, full-width colour bands below and a 2×2 grid of huge numbers.                   |
| **Type**    | Archivo Black for headings and big numbers, Archivo for body text.                              |
| **Shape**   | No corners, no shadows, no outlines; only flat fields of colour.                                |
| **Motion**  | Fast and crisp: no tilt, the card slides away at once.                                          |
| **Details** | Habits side by side in huge numbers (them / you); Pass and Like split the screen at the bottom. |

## Rules

- No radius, no shadow, no glass: colour fields and type only.
- Numbers carry the facts. Put rent, dates and scores in Archivo Black at `--text-3xl` or larger; long values (an area name) step down to `--text-xl`.
- White text only on `--band-ink`, `--band-red` and `--band-blue`; dark text on sky, mint, lilac and paper.
- Each group opens with a full-width `Band`; groups never share a band.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="poster"]`   |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token          | Value     |
| -------------- | --------- |
| `--band-ink`   | `#111111` |
| `--band-red`   | `#bf2a1a` |
| `--band-blue`  | `#2f5bff` |
| `--band-sky`   | `#a9d8ff` |
| `--band-mint`  | `#9be3c4` |
| `--band-lilac` | `#cbbcff` |
| `--band-paper` | `#f3f2ee` |
| `--text-6xl`   | `4.5rem`  |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

## Signature components

| Component     | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `Band`        | Full-width colour band that opens a group.                  |
| `HomeBands`   | Home group: 2×2 numeral tiles and the room on an ink band.  |
| `PersonBands` | Person group: bio, prompt band and the numeral habit table. |
| `FitBand`     | Fit group: giant score and thick bars.                      |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/poster";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="poster" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="poster"`.
