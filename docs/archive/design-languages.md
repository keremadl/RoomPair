# Archived design languages

The team compared six design languages for RoomPair and voted for
**F · Card with the Tabs layout**. The app now uses only that combination.
The other five languages, the side-by-side comparison page (`/directions`)
and the wireframe layout prototypes (`/layouts`) were removed from the code
on 6 November 2026.

## Where the code lives

Everything is preserved in git at commit **`86c893b`** on the
`claude/bold-sagan-9pfx5c` branch (the last commit with all six
languages). To look at it or bring a language back:

```bash
git show 86c893b:src/design-system/languages/collage/README.md
git checkout 86c893b -- src/design-system/languages/collage
```

A language that comes back also needs its font in
`src/design-system/languages/fonts.ts` and an entry in
`src/design-system/languages/index.ts`.

## What they looked like

Discover screen, phone and desktop, in both detail layouts.

| Language              | Idea                                                      | Blocks                                                                                                      | Tabs                                                                                                    |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| A · Chat              | The profile as a first chat with a future flatmate        | [desktop](design-languages/chat-blocks-desktop.jpg) · [phone](design-languages/chat-blocks-phone.jpg)       | [desktop](design-languages/chat-tabs-desktop.jpg) · [phone](design-languages/chat-tabs-phone.jpg)       |
| B · Collage           | A dorm fridge door: polaroids and stickers; four palettes | [desktop](design-languages/collage-blocks-desktop.jpg) · [phone](design-languages/collage-blocks-phone.jpg) | [desktop](design-languages/collage-tabs-desktop.jpg) · [phone](design-languages/collage-tabs-phone.jpg) |
| C · Poster            | Flat colour bands and huge numbers                        | [desktop](design-languages/poster-blocks-desktop.jpg) · [phone](design-languages/poster-blocks-phone.jpg)   | [desktop](design-languages/poster-tabs-desktop.jpg) · [phone](design-languages/poster-tabs-phone.jpg)   |
| D · Day               | The profile as an ordinary day you would share            | [desktop](design-languages/day-blocks-desktop.jpg) · [phone](design-languages/day-blocks-phone.jpg)         | [desktop](design-languages/day-tabs-desktop.jpg) · [phone](design-languages/day-tabs-phone.jpg)         |
| E · Floor plan        | The home as an architect's drawing                        | [desktop](design-languages/plan-blocks-desktop.jpg) · [phone](design-languages/plan-blocks-phone.jpg)       | [desktop](design-languages/plan-tabs-desktop.jpg) · [phone](design-languages/plan-tabs-phone.jpg)       |
| **F · Card (chosen)** | Each person as a game character card                      | [desktop](design-languages/card-blocks-desktop.jpg) · [phone](design-languages/card-blocks-phone.jpg)       | [desktop](design-languages/card-tabs-desktop.jpg) · [phone](design-languages/card-tabs-phone.jpg)       |

Note: in these screenshots Card is drawn in a system font. Its typeface,
Rubik, was not being loaded at the time; this was fixed together with the
archive.
