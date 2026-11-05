# A · Sohbet

Profili, müstakbel ev arkadaşınla ilk mesajlaşman gibi okursun.

Live reference: `/design-system?lang=chat`. Discover screen in both layouts: `/directions#chat-blocks`, `/directions#chat-tabs`.

## Principles

|               |                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------- |
| **Yerleşim**  | Fotoğraf kartı, altında soru–cevap baloncukları: kira, taşınma, oda, alışkanlıklar.          |
| **Tipografi** | Atkinson Hyperlegible: okuma güçlüğü için tasarlanmış font. 17px gövde, geniş satır aralığı. |
| **Biçim**     | Yumuşak köşeler, sola hizalı baloncuklar; italik ve büyük harf yok.                          |
| **Hareket**   | Yeni profilde mesajlar sırayla belirir, kart hafifçe döner.                                  |
| **Detaylar**  | Alışkanlıklar cevap içinde, her satırda 'senle aynı' ya da senin tercihin.                   |

## Rules

- Body text is 17px Atkinson Hyperlegible with 1.6 line height. Never set body copy smaller than `--text-md`.
- No italics and no all-caps labels anywhere: they are what made earlier directions hard to read.
- Questions are yours (right, `--bubble-you`), answers are theirs (left, `--bubble-them`). Keep that direction.
- Each group opens with a `Divider`; never mix Home and Person lines in one thread.
- Profile details always follow the shared content model in the order Home → Person → Fit (`ProfileDetails`, `@/lib/discover/sections`). Nothing about the place appears under Person, nothing about the person under Home.

## Files

| File                 | What                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `theme.css`          | Semantic and component token values for `[data-direction="chat"]`     |
| `styles.module.css`  | Styles for the signature components and screen (tokens only)          |
| `components.tsx`     | Signature components                                                  |
| `DiscoverScreen.tsx` | The Discover screen, `layout="blocks" \| "tabs"`                      |
| `index.ts`           | Public API: theme side effect, `DiscoverScreen`, signature components |

## Language tokens

Beyond the shared semantic tokens (`--color-*`, `--text-*`, `--space-*`, `--radius-*`), this language defines:

| Token           | Value     |
| --------------- | --------- |
| `--bubble-them` | `#ffffff` |
| `--bubble-you`  | `#d9efec` |
| `--bubble-note` | `#eceae5` |

Component tokens (`--control-*`, `--surface-*`, `--heading-weight`) at the end of `theme.css` give the core components (Button, IconButton, Chip, Input, Card, Tabs, FactGrid…) this language's character. Change them there, never in a component.

## Signature components

| Component      | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `Divider`      | Section divider pill, like a date line in a chat app.                |
| `Thread`       | Question and answer bubbles; yours on the right, theirs on the left. |
| `HomeThread`   | Home group: facts card, then the room as a photo bubble.             |
| `PersonThread` | Person group: bio, interests, prompt and habits as replies.          |
| `FitCard`      | Fit group: score, reasons and the expandable breakdown.              |

## Usage

```tsx
import { DiscoverScreen } from "@/design-system/languages/chat";
import { directionFontVariables } from "@/design-system/languages";

<div data-direction="chat" className={directionFontVariables}>
  <DiscoverScreen layout="blocks" />
</div>;
```

Core components render in this language automatically inside `data-direction="chat"`.
