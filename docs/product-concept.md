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

| Intent                 | Who                                                                                | What they need                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Looking for a room** | A student moving to the city, often international or exchange, without a place yet | People to live with, or a room in a shared flat, that fits their budget and dates |
| **Have a room**        | A student or young professional with a free room in their flat                     | Someone reliable and compatible to fill it                                        |

Each person answers **What are you looking for?** on their profile. Room seekers see hosts, with the room photo first; hosts see only room seekers. The demo is set in **Riga** with students from local universities. Riga is a suggested pilot city, not a validated market claim.

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

The interface is built from one design system in the **F · Card** design language: each person is shown as a character card (level, stat pips, a "you vs them" comparison, the room as an item card), with Rubik type, thick outlines and pressable buttons. Profile details are **tabs**: Room, Person and Fit (shown as XP), one at a time.

The team chose this after comparing six design languages and two detail layouts; the others are archived in [archive/design-languages.md](archive/design-languages.md). See [`src/design-system/README.md`](../src/design-system/README.md).

## 9. Current status

**Working demo** (Next.js, React, TypeScript), deployed on Vercel. Everything runs in the browser:

- swipe, keyboard and button decisions with undo; likes, mutual matches, conversations with simulated replies
- both search intents, explainable filtering and ranking, honest empty states
- saved rooms, move-in checklist, notes, viewing plan, onboarding
- report and block; a resettable demo state
- English and Turkish interface; more languages through an optional n8n translation workflow
- the Card design language with tabbed profile details, phone and desktop layouts
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

Filled canvases (PNG and PDF): [Business Model Canvas](business-model/RoomPair-Business-Model-Canvas.png), [Value Proposition Canvas](business-model/RoomPair-Value-Proposition-Canvas.png), and [both on one page](business-model/RoomPair-Canvases-One-Page.pdf). All prices and targets are **assumptions to test**, not market data.

### Business Model Canvas

| Block                      | RoomPair                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer segments**      | (1) **Room seekers** (main): students aged about 18–26 moving to Riga — international degree students, exchange students (e.g. Erasmus) and Latvians from other regions, often searching from abroad. (2) **Room hosts**: students and young professionals (20–35) with a free room in Riga. (3) **Student residences** with shared rooms: paying B2B customers, from the second pilot semester. Two-sided platform: seekers and hosts need each other. |
| **Value propositions**     | Seekers: only people who fit budget, dates and must-haves; a fit score with clear reasons; chat starters and a shared move-in plan. Hosts: only people who can pay the rent and move in on time, fewer wrong chats. Residences: fewer roommate conflicts, less manual matching. Fair: age, nationality, likes and money never change the ranking.                                                                                                       |
| **Channels**               | Hear: university welcome emails, orientation week, social media, QR posters. Try: free web app, no install. Sign up / pay: free account, Move-in pack in the app, direct sales to residences. After: email and in-app reminders, "invite your flatmate". Where students want to be reached is checked in interviews.                                                                                                                                    |
| **Customer relationships** | Self-service and automated, but personal (every fit score shows your own reasons); real people answer safety reports. Get: orientation-week stands, invite links, free start. Keep: useful after the match (chat, shared space, reminders). Grow: Move-in pack, seekers become hosts next semester, referrals.                                                                                                                                          |
| **Revenue streams**        | Core matching is free for everyone. **Primary:** residence licence, about €400 per residence per semester. **Secondary:** Move-in pack, €4.99 once per household (bill splitter, flat agreement template, reminders — no ranking boost); partner referrals, about 5–10% per order (moving, insurance, furniture). First pilot semester free for all. **Money never buys ranking or visibility.**                                                        |
| **Key resources**          | Human: developer, designer, business lead; later support and moderation. Intellectual: matching rules, prototype, design system, brand. Digital: cloud hosting and database. Financial: team time first; student startup grants to check. Most important: the community — enough seekers and hosts in one city.                                                                                                                                         |
| **Key activities**         | Build accounts, a server and live chat; grow both sides before each semester; trust and safety (student-email checks, reports, moderation); test the matching rules with real users; sell to student residences.                                                                                                                                                                                                                                        |
| **Key partnerships**       | University international offices and student unions (reach new students; they get fewer housing questions — partners, not paying customers); student organisations such as ESN sections; verification and hosting providers; moving, insurance and furniture companies (pay referral fees); a legal / GDPR advisor.                                                                                                                                     |
| **Cost structure**         | Product development (fixed, team time); hosting and database, verification and moderation (grow with users); marketing every semester (CAC = the cost to get one new user); sales to residences; legal and payment fees. Lean pilot: most early costs are team time; the budget is still to estimate.                                                                                                                                                   |

### Value Proposition Canvas (room seekers)

| Customer profile (ranked)                                                                                                                                                                                                                 | Value map                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Jobs:** 1. find an affordable room near the university (crucial, each move); 2. find a flatmate I can live with (crucial); 3. agree on bills, cleaning, guests (important, weekly); 4. make friends in a new city (nice, first months). | **Products & services:** 1. matching with hard checks + fit score; 2. Home / Person / Fit profiles; 3. chat with starters; 4. shared space (saved homes, checklist, notes, viewing date).                                                                                |
| **Pains:** 1. fear of scams and fake rooms (very intense, every search); 2. conflicts with the wrong flatmate (very intense, daily); 3. searching from abroad without a viewing; 4. chats that fail on budget or dates.                   | **Pain relievers:** 1. badges that say exactly what was checked, report and block; 2. living-style fit and a checklist on cleaning, guests, quiet hours; 3. neighbourhood, room photos and a viewing plan; 4. budget, dates (≤ 45 days), smoking and pets checked first. |
| **Gains:** 1. a flatmate with similar habits (essential, every day); 2. a room in budget and on time; 3. less time searching; 4. a plan for the move together (nice surprise).                                                            | **Gain creators:** 1. fit on tidiness, sleep and social energy; 2. budget and move-in date always fit; 3. fewer, better matches; 4. a five-step move-in checklist done together.                                                                                         |

Rankings are the team's first guess. Real verification and live chat between users are not built yet.

### Key assumptions to test

| We assume                                                | How we test                                  | Our target (a goal, not a forecast)      |
| -------------------------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| New students in Riga find it hard to get a good flatmate | 15 interviews with new and exchange students | Most rank it a top-3 problem             |
| Hosts join, not only seekers                             | Pilot in one university community            | 30 hosts and 100 seekers in one semester |
| Matches turn into shared homes                           | Ask matched pairs after 30 days              | 1 in 5 matches move in together          |
| Residences and students will pay                         | 3 residence talks; show the pack price       | 1 paid residence pilot; 5% buy the pack  |

Pilot plan: interviews (Nov–Dec 2026) → accounts, live chat and student-email check (Dec 2026–Jan 2027) → free pilot semester in Riga (Feb–Jun 2027) → decide prices (summer 2027).

## Related documents

| Document                                                      | Contents                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [README.md](../README.md)                                     | How to run the app, a three-minute jury walkthrough, matching rules, editing guide                          |
| [interface-research.md](interface-research.md)                | Study of Tinder, Bumble, Hinge, Feeld, happn, RoomSync, Diggz and Badi, and the product decisions it led to |
| [localization.md](localization.md)                            | Interface languages and the n8n translation workflow                                                        |
| [assets.md](assets.md)                                        | Sources of the photos; all people and homes are fictional                                                   |
| [src/design-system/README.md](../src/design-system/README.md) | Design system, the Card design language, rules                                                              |
