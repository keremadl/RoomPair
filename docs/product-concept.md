# RoomPair — product concept

**Good people. Better living.**
RoomPair helps students who are moving to a new city find a flatmate they will actually get along with, and then helps them plan the move together.

- Live demo: https://roompair.vercel.app
- Design languages side by side: https://roompair.vercel.app/directions
- Design system: https://roompair.vercel.app/design-system

This document is the single summary of what RoomPair is and why it works the way it does. Details live in the linked documents (see [Related documents](#related-documents)).

## 1. Problem

Moving to a new city for university means finding two things at once: a place to live and people to live with. The usual channels handle these badly.

- **Listings and housing groups** show rooms, not people. You learn about rent and square metres, almost nothing about who you will share a kitchen with.
- **Dating-style swipe apps** show people, but optimise for attraction and chemistry. Living together depends on different things: budget, move-in date, tidiness, sleep, guests, smoking, pets.
- **Compatibility percentages** in existing roommate apps are usually a black box. A high score can hide a hard mismatch (the rent is out of budget, the dates are two months apart).
- **After the match nothing happens.** Two people who like each other still have to organise viewings, compare homes and agree on house rules somewhere else.

## 2. Who it is for

The product serves two sides of the same match:

| Intent                               | Who                                                                                | What they need                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Find a room** (or search together) | A student moving to the city, often international or exchange, without a place yet | People to live with, or a room in a shared flat, that fits their budget and dates |
| **Have a room**                      | A student or young professional with a free room in their flat                     | Someone reliable and compatible to fill it                                        |

A person can also choose **either**. The demo is set in **Riga** with students from local universities. Riga is a suggested pilot city, not a validated market claim.

## 3. Value proposition

1. **People first, practical facts up front.** Every profile leads with the person, their housing intent, budget or rent and move-in date.
2. **Hard requirements before soft fit.** City, budget, dates, smoking, pets and active search are checked first. A high lifestyle score can never override a hard mismatch.
3. **A fit score you can read.** The percentage comes with its reasons, the things to talk about and the exact weights behind it.
4. **Something useful after a match.** Matches lead to a conversation with starters, a shared space for saved homes, a move-in checklist, notes and a viewing plan.
5. **Honest about trust.** A badge says exactly what was checked (for example a student email) and nothing more.

### How RoomPair differs

Based on the interface study in [interface-research.md](interface-research.md):

| Existing products            | What they do well                                 | Where RoomPair differs                                                                                      |
| ---------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tinder, Bumble, Hinge, happn | Photo-led cards, swipe, prompts, clear intentions | RoomPair compares living habits and housing facts, not attraction                                           |
| RoomSync                     | Mutual swipe, lifestyle compatibility, chat       | Swipe plus a percentage is established, so the difference is explainability and what happens after matching |
| Diggz, Badi                  | Rent, move-in month, room or no room, listings    | RoomPair keeps those facts but puts the person and the household conversation at the centre                 |

## 4. Product principles

- **Not a dating app.** Profiles answer two separate questions: _What is the place like?_ and _Who would I live with?_ Then a third: _Would we get along?_
- **Home / Person / Fit.** Every fact belongs to exactly one group. Nothing about the place appears under Person, and nothing about the person under Home. For someone without a room, Home shows the home they are looking for.
- **Preferences and tolerance, not sameness.** Shared living works without identical personalities, so the app asks what people prefer and what they can live with.
- **Every gesture has a button.** Swipe, buttons and arrow keys do the same thing, and undo is always available.
- **Accessible by default.** Readable type (12px minimum, 16px body), contrast-checked colours, labelled controls, focus-managed dialogs, reduced-motion support.

## 5. The experience

| Screen                   | What happens                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Onboarding** (4 steps) | Name, city and intent; budget, move-in date and stay; living style (tidiness, social energy, sleep); must-haves (smoke-free, pets)                                             |
| **Discover**             | One card at a time: photo, name, age, intent, rent or budget, move-in date. Below it, Home → Person → Fit as blocks or tabs. Like, pass and undo. A second mode browses rooms. |
| **Filters**              | City, budget, dates, intent, smoke-free, pets, verified only. An honest empty state when nobody fits.                                                                          |
| **Match**                | When both people like each other, a match screen leads straight into a conversation.                                                                                           |
| **Messages**             | Conversation list, starter prompts (for example "What's your ideal Sunday at home?") and clearly labelled simulated replies in the demo.                                       |
| **Likes**                | People who liked you, people you liked, and like back.                                                                                                                         |
| **My space**             | Saved homes, a five-step move-in checklist (budget and bills, cleaning rhythm, guests and quiet hours, a viewing together, house rules), shared notes and a viewing date.      |
| **Profile**              | Living style, trust information, interface language, design language and demo settings.                                                                                        |
| **Safety**               | Report and block on every profile; blocked people disappear from discovery.                                                                                                    |

## 6. How matching works

Implemented in `src/lib/matching.ts`, deliberately simple enough to explain to a user.

**Step 1 — eligibility (any failure removes the person):**
same city; overlapping budget, or a room price within your budget; compatible intent (two people who both have a room do not match); move-in dates at most 45 days apart; smoke-free and no-pets must-haves; active search; optional verified-only filter.

**Step 2 — weighted fit score:**

| Factor         | Weight |
| -------------- | ------ |
| Budget         | 25%    |
| Tidiness       | 20%    |
| Sleep schedule | 15%    |
| Social energy  | 15%    |
| Move-in timing | 15%    |
| Length of stay | 10%    |

The result lists the reasons the two people fit, the differences worth discussing and each factor's score. Age, nationality, popularity and likes never influence ranking. The percentage compares stated preferences; it is **not** a prediction that living together will work.

## 7. Trust and safety

- Verification badges describe exactly what was checked; a student email is not proof of identity, behaviour or safety.
- Report (with reasons) and block are available on every profile.
- Exact home addresses are never shown; only the neighbourhood.
- In the demo, verification, reports and replies are demonstrative and labelled as such.

## 8. Design

The interface is built from one design system with **six design languages** that can be switched live from the top-right **Design** menu. All six share the same components, content model and behaviour:

| Language       | Idea                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| A · Chat       | The profile as a first chat with a future flatmate                                          |
| B · Collage    | A dorm fridge door: polaroids and stickers; four palettes (Lavender, Forest, Sunset, Night) |
| C · Poster     | Flat colour bands and huge numbers, readable at a glance                                    |
| D · Day        | The profile as an ordinary day you would share                                              |
| E · Floor plan | The home as an architect's drawing                                                          |
| F · Card       | Each person as a game character card                                                        |

Profile details can be shown as **Blocks** (everything visible, in a fixed order) or **Tabs** (one group at a time). The team has not yet chosen a final language; the switch exists to compare them with real users. See [`src/design-system/README.md`](../src/design-system/README.md).

## 9. Current status

**Working demo** (Next.js, React, TypeScript), deployed on Vercel. Everything runs in the browser:

- swipe, keyboard and button decisions with undo; likes, mutual matches, conversations with simulated replies
- both search intents, explainable filtering and ranking, honest empty states
- saved rooms, move-in checklist, notes, viewing plan, onboarding
- report and block; a resettable demo state
- English and Turkish interface; more languages through an optional n8n translation workflow
- six design languages, two detail layouts, phone and desktop layouts
- automated checks: type checking, design-token and contrast guard, unit tests and end-to-end tests

**Not built yet:** accounts and authentication, a server database, real-time messaging between real users, identity or property verification, moderation, payments or bookings. All people, rooms, messages and badges are fictional; photos are stock images (see [assets.md](assets.md)). Data stays in the browser's local storage.

## 10. Next steps (product and technology)

1. Authenticated accounts and server persistence.
2. Real-time messaging and a shared space that synchronises between both people.
3. Student-email verification, then moderation for reports.
4. Choose one design language (or a combination) through user testing.
5. Pilot with one university community and measure matches that turn into shared homes.

The data model, matching engine and interface text are already separated, so these services can replace the demo layer without redesigning the interface.

## 11. Business model

_To be written._ This section will be completed from the business model brief.

## Related documents

| Document                                                      | Contents                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [README.md](../README.md)                                     | How to run the app, a three-minute jury walkthrough, matching rules, editing guide                          |
| [interface-research.md](interface-research.md)                | Study of Tinder, Bumble, Hinge, Feeld, happn, RoomSync, Diggz and Badi, and the product decisions it led to |
| [localization.md](localization.md)                            | Interface languages and the n8n translation workflow                                                        |
| [assets.md](assets.md)                                        | Sources of the photos; all people and homes are fictional                                                   |
| [src/design-system/README.md](../src/design-system/README.md) | Design system, the six design languages, rules                                                              |
