# Slop audit: pages other than Discover

Audit of the app after the switch to **F · Card + Tabs** (6 November 2026),
before redesigning Likes, Messages, My space, My profile, the room list and
the dialogs. Screenshots of the current state are in [`before/`](before/).

"Slop" here means interface that fills space without helping the person:
decorative text, generic card grids, repeated filler phrases, boxes that say
nothing, and things that look different on every page.

## 1. Across the whole app

| #   | Problem                                                                                                                                                                                                                          | Where                                   | Why it hurts                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | **Filler copy.** "a little" appears **27 times** in the English texts and "chapter" **13 times** ("A little more you.", "A little shared notebook", "Put a little plan in place.", "Your next chapter"…).                        | All pages, toasts, dialogs              | Sounds like generated marketing text; nothing tells the person what to do.                                                   |
| 1.2 | **The same page header everywhere:** uppercase eyebrow + slogan headline + grey sentence ("A LITTLE MUTUAL FEELING / A good feeling, returned. / People who'd love to…").                                                        | Every page                              | Takes ~130 px (a third of a phone screen) before any content. The page title never says the page name ("Likes", "Messages"). |
| 1.3 | **Card language only on Discover.** Discover has level, stat pips, XP, "Team up / Skip". Every other page is a plain rounded card with an offset shadow.                                                                         | Likes, Messages, Space, Profile         | The chosen design language disappears after the first page.                                                                  |
| 1.4 | **Words change from page to page:** Team up / Like / Like back; Skip / Pass ("Passed" toast); 96 XP / 96% fit / 93% lifestyle fit; Room / The room / Item: the room.                                                             | Discover vs Likes vs Messages vs toasts | The same thing has three names.                                                                                              |
| 1.5 | **Sidebar promo card** "YOUR NEXT CHAPTER / A place is better with your people. / Find your living style" is always on screen, plus the footnote "Student project · Demo community".                                             | Desktop sidebar                         | Permanent advert for something already in the profile.                                                                       |
| 1.6 | ~~Sidebar background stops on long pages.~~ Not a bug: the sidebar is sticky and follows the scroll; it only looked cut off in full-page screenshots.                                                                            | —                                       | —                                                                                                                            |
| 1.7 | **Disclaimers scattered** as small grey lines: "Demo replies are simulated…", "A conversation starts with a mutual like.", "A shared-living checklist, not a rental agreement.", "Demo student badges illustrate verification…". | Messages, Space, Profile                | Necessary honesty, but repeated in four styles; reads as noise. One clear demo notice would do.                              |
| 1.8 | **Dates in US format** in date fields (mm/dd/yyyy) while the app shows "1 Feb 2027".                                                                                                                                             | Onboarding, Filters, Space              | Inconsistent; confusing for European students.                                                                               |

## 2. Likes

| #   | Problem                                                                                                                          | Why it hurts                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 2.1 | **Instagram-style photo gallery:** four portrait photos ~400 px tall per row; each shows only name, study, area and "Like back". | No information to decide on: no rent/budget, move-in date, room or not, or why they fit. |
| 2.2 | "Like back" creates a match **straight from the grid**, without seeing the profile.                                              | A big decision with no context.                                                          |
| 2.3 | "Your likes · 0" tab is an empty page.                                                                                           | Wasted tab when there is nothing to show.                                                |

## 3. Messages

| #   | Problem                                                                                                                               | Why it hurts                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 3.1 | The chat sits **inside a box under the page header**; on phones the composer is below the fold.                                       | A chat should use the whole screen.                      |
| 3.2 | **Dashed promo banner** inside the chat: "Turn a good conversation into a home."                                                      | Advert inside a conversation.                            |
| 3.3 | System lines and labels that say nothing: "You found a little common ground.", "Demo conversation", search box for two conversations. | Noise around the messages.                               |
| 3.4 | Smiley button only appends "☺".                                                                                                       | A button that looks like an emoji picker but is not one. |
| 3.5 | Fit strip says "93% lifestyle fit" while Discover says "XP".                                                                          | See 1.4.                                                 |

## 4. My space

| #   | Problem                                                                                                                                                                 | Why it hurts                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 4.1 | **Decorative banner** "YOUR RIGA CHAPTER / Let's make room for real life." with two facts in a grey box.                                                                | Repeats profile facts; no action.                         |
| 4.2 | Saved places, notes, checklist and viewing date are **four separate boxes that do not connect**: the viewing is not for a place, notes are not about a place or person. | It looks like a dashboard, but it does not plan anything. |
| 4.3 | "Shared notes" but "Saved on this device".                                                                                                                              | Contradiction.                                            |
| 4.4 | Checklist hints are jokes ("Rent, utilities, and the occasional pizza."); done items are struck through.                                                                | Filler; the struck-through text is hard to read.          |
| 4.5 | "Add a place" just jumps to Discover.                                                                                                                                   | A fake action.                                            |

## 5. My profile

| #   | Problem                                                                                                                               | Why it hurts                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 5.1 | Big centred avatar card: initial "A", "Riga · Your next chapter", pill "I'm finding my people", "Make it yours in a few small steps." | Decoration; the useful content is below.                                                         |
| 5.2 | "My living style" shows only 4 facts; tidiness, social energy, pets, stay length and intent are missing.                              | You cannot see what others see. In Card, your own profile should be **your own character card**. |
| 5.3 | A whole card for one language dropdown; a grey "Trust is in the details." box.                                                        | Large boxes for small settings.                                                                  |

## 6. Room list (Discover → Find a room)

| #   | Problem                                                                         | Why it hurts           |
| --- | ------------------------------------------------------------------------------- | ---------------------- |
| 6.1 | Heading "A space for your next chapter." / "Thoughtfully picked demo homes."    | Filler (1.1, 1.2).     |
| 6.2 | **Two rooms use the same photo** (Avoti and Teika: `room-3.jpg`).               | Looks fake.            |
| 6.3 | Room cards show only price, title and area: no host, move-in date, stay or fit. | Not enough to compare. |

## 7. Dialogs

| #   | Problem                                                                                                                                                                                         | Why it hurts                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 7.1 | **Filters and onboarding ask the same things with different labels** ("Monthly budget, from / Up to" vs "Monthly budget · Minimum / Maximum"; "Stay in months" vs "How long are you staying?"). | Two places to edit the same data.  |
| 7.2 | Toasts with slogans ("Your search feels a little more like you.", "Like sent. A little hello goes a long way.").                                                                                | Feedback should say what happened. |

## Proposed direction for the redesign

1. **Plain page titles, no slogans:** title = page name + one useful line (counts, next step). Rewrite all copy; ban "a little" and "chapter".
2. **Carry the Card language everywhere:** Likes as a hand of compact character cards with level, key stats and fit; your profile as your own character card; matches and chats keep the same card identity.
3. **One vocabulary:** pick one word each for like / pass / fit (XP or %), and use it everywhere.
4. **Messages full height**, no banners; a small match card at the top of the chat.
5. **My space as a real plan:** one list of saved places, each with its viewing date and notes, plus the checklist; or a "household" view per match.
6. **One demo notice** (for example in Settings / Help) instead of grey footnotes on every page.
7. **Fix the bugs:** sidebar height, date format, duplicate room photo.

## Done (6 November 2026)

- Slogan headers removed from every page (screen readers still get a hidden page title).
- Fit is shown as **%** everywhere, age as **Age 23** (no more XP / LV).
- One vocabulary: **Team up / Skip**, "96% fit", "Saved rooms".
- Likes: compact character cards with type, age, fit, rent or budget, move-in, stay and stats; "View profile" next to "Team up".
- Messages: full-height chat, header with age, % fit, type and area; banners, fake emoji button, filler lines and footnotes removed; search only from six chats.
- My space: saved rooms with host, move-in and stay, each with its own viewing date; a checklist of concrete questions; notes labelled "Only saved on this device".
- My profile: your own character card with all answers, plus a small Settings panel.
- Room list: host, move-in and stay on every card; Teika has its own photo (`room-4.jpg`).
- Sidebar: promo card and footnote removed. One demo notice in Help instead of grey lines on every page.
- Filters and setup use the same labels; all toasts say what happened; filler copy rewritten (English and Turkish).
- Not changed: date fields follow the browser's language (a US-English browser shows mm/dd/yyyy).
