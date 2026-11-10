# RoomPair database

The schema for accounts and shared data lives in `supabase/` and is applied to a hosted Supabase project (Postgres 17, region `eu-central-1`). **The app uses it only when it is configured:** with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set, the interface asks people to sign in and reads and writes here; without them it stays the self-contained demo that keeps everything in the browser.

## How the app talks to it

The interface keeps editing its state optimistically, exactly as in the demo. In account mode each edit is turned into writes and followed by a fresh read:

| File                                | Role                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `src/lib/app-data.ts`               | One hook for both modes; queues writes, re-reads after them and on live updates |
| `src/lib/backend/sync.ts`           | Pure function: two states in, the writes that reconcile them out (unit-tested)  |
| `src/lib/backend/mapping.ts`        | Rows to app types and back (unit-tested)                                        |
| `src/lib/backend/remote.ts`         | The actual queries, photo uploads and signed photo links                        |
| `src/components/app/AuthScreen.tsx` | Sign in and sign up                                                             |

New messages and matches are pushed live (Supabase Realtime, filtered by the same row level security); a check every fifteen seconds while the tab is visible covers new likes and anything missed. Likes are not pushed on purpose: a removed row is announced to every listener by its key, which for a like says who liked whom. A write the database rejects is dropped on the next read, so the screen always ends up showing what the server decided. Photos picked on the device are uploaded to the private buckets; other people's photos are shown through signed links that last an hour.

`npm run test:accounts` runs the browser tests for this mode against a local Supabase stack (`npx supabase start`); CI does the same.

## Layout

| Path                            | Purpose                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `supabase/migrations/*.sql`     | Schema, privileges, row level security and triggers, in order                   |
| `scripts/db/generate-seed.ts`   | Writes `seed.sql` from the demo people in `src/lib/data.ts` (`npm run db:seed`) |
| `supabase/seed.sql`             | The 22 demo people as accounts, plus their 11 rooms; generated, safe to re-run  |
| `supabase/tests/policies.sql`   | Authorization tests; runs in one transaction and rolls everything back          |
| `supabase/tests/local-stub.sql` | Stand-in for Supabase's `auth` schema so the tests run on plain Postgres        |
| `supabase/tests/run-local.sh`   | Builds a throwaway database, applies everything and runs the tests              |

## Tables

| Table                | Holds                                                       | Who can read                                 | Who can write                                 |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| `profiles`           | One row per account: answers, habits, must-haves            | Yourself; onboarded, active members; matches | Yourself, except `verified` and demo flags    |
| `rooms`              | One listing per host, with deposit, bills, flatmates, rules | Members, when the room is available          | The owner                                     |
| `swipes`             | A like or a pass                                            | The sender; the receiver for likes only      | The sender                                    |
| `matches`            | A pair who liked each other                                 | The two people                               | Nobody; a trigger creates and removes them    |
| `messages`           | Conversation inside a match                                 | The two people                               | A participant, as themselves; never edited    |
| `conversation_reads` | When you last read a conversation                           | Yourself                                     | Yourself                                      |
| `saved_rooms`        | Rooms you bookmarked                                        | Yourself                                     | Yourself                                      |
| `moving_plans`       | Checklist, notes and viewing time                           | Yourself                                     | Yourself                                      |
| `blocks`             | People you blocked                                          | Yourself                                     | Yourself                                      |
| `reports`            | Reports you filed                                           | Yourself                                     | Yourself; the status only by the service role |

Signed-out visitors can read nothing. A block hides both people, and the blocked person's rooms, from each other.

## Photos

Photo files live in two private Storage buckets; the tables only keep paths. Nothing is public: the app asks for short-lived signed links, and storage policies decide who may ask.

| Bucket           | Path                 | Who can read                   | Who can write          |
| ---------------- | -------------------- | ------------------------------ | ---------------------- |
| `profile-photos` | `<member id>/<file>` | Members, except across a block | The member, own folder |
| `chat-photos`    | `<match id>/<file>`  | The two people in the match    | The two people         |

Both buckets accept JPEG, PNG and WebP up to 5 MB. When a profile is saved, files in the member's folder that no profile or listing uses any more are deleted. A chat photo can be removed only by the member who sent it. Demo people still use the images bundled with the app (`/images/...`).

## How access is enforced

Three layers, all in the database, so a modified client cannot bypass them:

1. **Grants.** Privileges are revoked first and granted back per table and per column. Server-owned columns (ids, timestamps, `verified`, `is_demo`, a report's `status`) are not writable even on your own rows. `sender_id`, `swiper_id` and similar columns default to the signed-in user and cannot be supplied.
2. **Row level security.** Enabled on every table. Policies name the `authenticated` role and compare against `auth.uid()`.
3. **Constraints.** The form rules are repeated as checks: budget 100–5000 with the maximum above the minimum, stay 1–24 months, lifestyle answers 1–5, age 18 or older, message length 1–2000.

Helper and trigger functions live in the `private` schema, which the Data API does not expose. They run as `security definer` with an empty `search_path`.

## Behaviour implemented by triggers

- **Sign-up** creates the profile row; onboarding fills it in. A profile cannot be marked onboarded with answers missing.
- **Two opposite likes** create one match. Clients cannot insert matches.
- **Undoing a like** removes the match unless the two already exchanged messages.
- **Blocking** removes the match, its conversation and both swipes.
- **Deleting an account** (`public.delete_account()`, callable only for yourself) removes the sign-in; the profile, room, likes, matches, messages, blocks and reports cascade from it. The app deletes the member's photo files first.
- **Demo behaviour** (second migration): eleven demo accounts like every member who finishes onboarding, so a first mutual match is one swipe away. It is isolated so it can be dropped as a unit.

## Demo accounts

The 22 people from the demo are real rows in `auth.users` with `is_demo = true`. Nobody can sign in as them: each has a random password that is not stored anywhere, and their `@demo.roompair.example` addresses are reserved and receive no mail. They never reply to messages.

## Running the tests

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres supabase/tests/run-local.sh
```

The script needs `psql` and a PostgreSQL server where it may create a database. It applies the stub, the migrations and the seed (twice, to prove it is repeatable), then runs `policies.sql`, which signs in as three members and asserts about fifty rules, for example that nobody can like or message on someone else's behalf, read another pair's conversation, or verify themselves. CI runs the same script on every pull request.

The same tests passed against the hosted project after the schema was applied.

## Applying changes to the hosted project

Add a new timestamped file to `supabase/migrations/`; never edit one that has been applied. Apply it with the Supabase CLI (`supabase db push`) or the SQL Editor, then run `policies.sql`.

Known limitation: Supabase's free plan pauses a project after about a week without activity, and its built-in email service allows only a few messages per hour.
