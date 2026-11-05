# F · Kart

Herkes bir oyun karakter kartı: seviye, statlar, yetenekler, görevler.

Live reference: `/design-system?lang=card`. Discover screen in both layouts: `/directions#card-blocks`, `/directions#card-tabs`.

## Principles

|               |                                                                                      |
| ------------- | ------------------------------------------------------------------------------------ |
| **Yerleşim**  | Tür rengine göre çerçeveli kart; altında 'sen vs o' statları, eşya kartı olarak oda. |
| **Tipografi** | Rubik: yuvarlak hatlı, kalın ama tam boyda okunaklı.                                 |
| **Biçim**     | Kalın kontur, basılabilir 3B butonlar, stat pipleri, XP çubuğu.                      |
| **Hareket**   | Oyunsu ve zıplayan; butonlar basınca çöker.                                          |
| **Detaylar**  | Uyum = XP; eşleşme gerekçeleri tamamlanmış, konuşulacaklar açık görevler.            |

## Rules

- The card front shows the person only: level (age), type, class, stats. Rent and dates are Home, on the `HomeItem`.
- Frame colour encodes type: `--type-host` (has a room), `--type-explorer` (looking together).
- Buttons press down by `--press-depth` and lose their `--press-shadow`; keep that on every pressable.
- Game words stay light (XP, quests, abilities); facts stay plain ("€420 per month").
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="card"]`     |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token             | Value             |
| ----------------- | ----------------- |
| `--type-host`     | `#17784d`         |
| `--type-explorer` | `#2d62c9`         |
| `--stat-on`       | `#5b3fd6`         |
| `--stat-off`      | `#d9dfeb`         |
| `--xp`            | `#f5a524`         |
| `--press-depth`   | `4px`             |
| `--press-shadow`  | `0 4px 0 #1d2240` |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

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
