# E · Ev Planı

Paylaşacağınız ev bir mimari çizim; bilgiler teknik bir şartname kadar net.

Live reference: `/design-system?lang=plan`. Discover screen in both layouts: `/directions#plan-blocks`, `/directions#plan-tabs`.

## Principles

|               |                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Yerleşim**  | Etiket sekmeli fotoğraf; detaylar numaralı çizim paftaları gibi: 01 Ev, 02 Kişi, 03 Uyum.          |
| **Tipografi** | Schibsted Grotesk: net, teknik ama sıcak bir grotesk.                                              |
| **Biçim**     | Lacivert çizgiler, çizim kağıdı ızgarası, tek mercan vurgu: senin odan.                            |
| **Hareket**   | Az ve net; odalar arası geçiş kısa bir solma.                                                      |
| **Detaylar**  | Ev paftasında kat planı ve senin odan vurgulu; kişi ve alışkanlıklar ayrı bir şartname tablosunda. |

## Rules

- Lines, not shadows: 2px `--plan-line` for structure, `--color-border` for rows.
- Coral (`--color-accent`, `--plan-yours`) marks one thing only: the room you would live in.
- The floor plan shows the home. Person facts live in spec tables, never on the drawing.
- Groups are numbered sheets: 01 Home, 02 Person, 03 Fit.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="plan"]`     |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token           | Value     |
| --------------- | --------- |
| `--plan-line`   | `#14325c` |
| `--plan-room`   | `#ffffff` |
| `--plan-yours`  | `#fde6df` |
| `--plan-grid`   | `#dbe3ee` |
| `--plan-stroke` | `2px`     |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

## Signature components

| Component               | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `SheetTitle`            | Numbered drawing-sheet heading: 01 Home, 02 Person, 03 Fit. |
| `FlatDrawing`           | SVG floor plan of the flat, your room highlighted.          |
| `SpecTable`             | Label and value rows, like a specification.                 |
| `HomeSpec / PersonSpec` | Home and Person groups as drawing and spec tables.          |
| `Fit`                   | Fit group: score and bar table.                             |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/plan";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="plan" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="plan"`.
