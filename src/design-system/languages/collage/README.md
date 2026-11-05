# B · Collage

A dorm fridge door: polaroids, stickers, personality first.

Live reference: `/design-system?lang=collage`. Discover screen in both layouts: `/directions#collage-blocks`, `/directions#collage-tabs`.

## Principles

|             |                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| **Layout**  | A slightly tilted polaroid with stickers on top. Details in speech bubbles and colour blocks. |
| **Type**    | A bold grotesque with character (Bricolage Grotesque 800) and Figtree.                        |
| **Shape**   | 2px outlines, hard offset shadows, generous rounding, saturated sticker colours.              |
| **Motion**  | A bouncy spring. The card tilts clearly while dragged.                                        |
| **Details** | Habits as block meters, them and you; fit as thick coloured bars.                             |

## Rules

- Every control has a 2px ink outline and a hard offset shadow (`--shadow-hard`, `--shadow-hard-sm`); never a blurred shadow.
- Text on a sticker always uses `--color-on-sticker`, so it stays dark on pastel stickers in every palette, including Night.
- Tilt stickers by at most 3–5°; tilt the photo polaroid not at all at rest, only while dragging.
- Pick one palette per screen: Lavender (default), Forest, Sunset or Night (`data-palette`).
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="collage"]`  |
| `palette-*.css`      | Colour palettes: Forest, Sunset, Night (`data-palette`)               |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token                | Value               |
| -------------------- | ------------------- |
| `--color-ink`        | `#17142b`           |
| `--sticker-lime`     | `#d4f57a`           |
| `--sticker-pink`     | `#ffc2dd`           |
| `--sticker-blue`     | `#b9c6ff`           |
| `--sticker-coral`    | `#ff9c84`           |
| `--sticker-mint`     | `#a8ecd0`           |
| `--color-on-sticker` | `#17142b`           |
| `--stroke`           | `2px`               |
| `--shadow-hard`      | `4px 4px 0 #17142b` |
| `--shadow-hard-sm`   | `2px 2px 0 #17142b` |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

## Signature components

| Component        | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `GroupTitle`     | Tilted sticker heading, one colour per group.                 |
| `Blocks`         | Five-step block meter for a 1–5 habit.                        |
| `HomeStickers`   | Home group: fact stickers and the room as a taped polaroid.   |
| `PersonStickers` | Person group: speech bubble, vibe meters and lifestyle tiles. |
| `FitBars`        | Fit group: chunky outlined score bars.                        |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/collage";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="collage" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="collage"`.
