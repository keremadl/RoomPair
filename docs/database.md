# RoomPair database

The schema for accounts and shared data lives in `supabase/` and is applied to a hosted Supabase project (Postgres 17, region `eu-central-1`). **The app does not read from it yet:** the interface still runs on the browser-local demo state. Connecting the two is the next step and is tracked in [BACKLOG.md](BACKLOG.md).

## Layout

| Path                            | Purpose                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `supabase/migrations/*.sql`     | Schema, privileges, row level security and triggers, in order            |
| `supabase/seed.sql`             | The ten demo people as accounts, plus their four rooms; safe to re-run   |
| `supabase/tests/policies.sql`   | Authorization tests; runs in one transaction and rolls everything back   |
| `supabase/tests/local-stub.sql` | Stand-in for Supabase's `auth` schema so the tests run on plain Postgres |
| `supabase/tests/run-local.sh`   | Builds a throwaway database, applies everything and runs the tests       |

## Tables

| Table                | Holds                                            | Who can read                                 | Who can write                                 |
| -------------------- | ------------------------------------------------ | -------------------------------------------- | --------------------------------------------- |
| `profiles`           | One row per account: answers, habits, must-haves | Yourself; onboarded, active members; matches | Yourself, except `verified` and demo flags    |
| `rooms`              | Listings offered by a member                     | Members, when the room is available          | The owner                                     |
| `swipes`             | A like or a pass                                 | The sender; the receiver for likes only      | The sender                                    |
| `matches`            | A pair who liked each other                      | The two people                               | Nobody; a trigger creates and removes them    |
| `messages`           | Conversation inside a match                      | The two people                               | A participant, as themselves; never edited    |
| `conversation_reads` | When you last read a conversation                | Yourself                                     | Yourself                                      |
| `saved_rooms`        | Rooms you bookmarked                             | Yourself                                     | Yourself                                      |
| `moving_plans`       | Checklist, notes and viewing time                | Yourself                                     | Yourself                                      |
| `blocks`             | People you blocked                               | Yourself                                     | Yourself                                      |
| `reports`            | Reports you filed                                | Yourself                                     | Yourself; the status only by the service role |

Signed-out visitors can read nothing. A block hides both people, and the blocked person's rooms, from each other.

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
- **Demo behaviour** (second migration): five demo accounts like every member who finishes onboarding, so a first mutual match is one swipe away. It is isolated so it can be dropped as a unit.

## Demo accounts

The ten people from the prototype are real rows in `auth.users` with `is_demo = true`. Nobody can sign in as them: each has a random password that is not stored anywhere, and their `@demo.roompair.example` addresses are reserved and receive no mail. They never reply to messages.

## Running the tests

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres supabase/tests/run-local.sh
```

The script needs `psql` and a PostgreSQL server where it may create a database. It applies the stub, the migrations and the seed (twice, to prove it is repeatable), then runs `policies.sql`, which signs in as three members and asserts about forty rules, for example that nobody can like or message on someone else's behalf, read another pair's conversation, or verify themselves. CI runs the same script on every pull request.

The same tests passed against the hosted project after the schema was applied.

## Applying changes to the hosted project

Add a new timestamped file to `supabase/migrations/`; never edit one that has been applied. Apply it with the Supabase CLI (`supabase db push`) or the SQL Editor, then run `policies.sql`.

Known limitation: Supabase's free plan pauses a project after about a week without activity, and its built-in email service allows only a few messages per hour.
