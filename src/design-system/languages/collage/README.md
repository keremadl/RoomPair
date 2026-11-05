# B · Kolaj

Yurt odasındaki buzdolabı kapağı: polaroidler, çıkartmalar, kişilik önde.

Live reference: `/design-system?lang=collage`. Discover screen in both layouts: `/directions#collage-blocks`, `/directions#collage-tabs`.

## Principles

|               |                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------ |
| **Yerleşim**  | Hafif eğik polaroid ve üstüne yapışmış çıkartmalar. Detaylar konuşma balonu ve renkli bloklarla. |
| **Tipografi** | Kalın, karakterli grotesk (Bricolage Grotesque 800) ve Figtree.                                  |
| **Biçim**     | 2px kontur, sert ofset gölge, cömert yuvarlaklık, doygun çıkartma renkleri.                      |
| **Hareket**   | Esnek, zıplayan yay. Kart sürüklenirken belirgin şekilde döner.                                  |
| **Detaylar**  | Alışkanlıklar blok metrelerle 'o ve sen'; uyum kalın renkli barlarla.                            |

## Rules

- Every control has a 2px ink outline and a hard offset shadow (`--shadow-hard`, `--shadow-hard-sm`); never a blurred shadow.
- Text on a sticker always uses `--color-on-sticker`, so it stays dark on pastel stickers in every palette, including Gece.
- Tilt stickers by at most 3–5°; tilt the photo polaroid not at all at rest, only while dragging.
- Pick one palette per screen: Lavanta (default), Orman, Gün batımı or Gece (`data-palette`).
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="collage"]`  |
| `palette-*.css`      | Colour palettes: Orman, Gün batımı, Gece (`data-palette`)             |
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
