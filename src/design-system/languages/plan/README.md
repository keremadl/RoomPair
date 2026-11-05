# E · Floor plan

The home you would share as an architect's drawing; facts as clear as a spec sheet.

Live reference: `/design-system?lang=plan`. Discover screen in both layouts: `/directions#plan-blocks`, `/directions#plan-tabs`.

## Principles

|             |                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| **Layout**  | A photo with a label tab; details as numbered drawing sheets: 01 Home, 02 Person, 03 Fit.                           |
| **Type**    | Schibsted Grotesk: a clear, technical yet warm grotesque.                                                           |
| **Shape**   | Navy lines, a drafting-paper grid and one coral highlight: your room.                                               |
| **Motion**  | Minimal and precise; moving between rooms is a short fade.                                                          |
| **Details** | The home sheet shows the floor plan with your room highlighted; the person and habits sit in a separate spec table. |

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
