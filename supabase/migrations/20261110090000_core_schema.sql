-- RoomPair core schema: profiles, rooms, likes, matches, messages and the
-- per-user planning data. Every table has row level security enabled and
-- explicit, minimal grants; nothing is readable without signing in.

create schema if not exists private;
comment on schema private is
  'Helpers and trigger functions. Not exposed through the Data API.';

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 48),
  age smallint check (age between 18 and 120),
  occupation text check (char_length(occupation) <= 80),
  university text check (char_length(university) <= 120),
  city text check (char_length(btrim(city)) between 1 and 70),
  neighborhood text check (char_length(neighborhood) <= 70),
  bio text check (char_length(bio) <= 600),
  photo_url text check (char_length(photo_url) <= 500),
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  tags text[] not null default '{}' check (cardinality(tags) <= 8),
  prompt_question text check (char_length(prompt_question) <= 120),
  prompt_answer text check (char_length(prompt_answer) <= 400),
  -- What the person is looking for.
  intent text check (intent in ('find-room', 'have-room', 'either')),
  budget_min integer check (budget_min between 100 and 4999),
  budget_max integer check (budget_max between 101 and 5000),
  move_date date,
  stay_months smallint check (stay_months between 1 and 24),
  -- How the person lives.
  cleanliness smallint check (cleanliness between 1 and 5),
  social smallint check (social between 1 and 5),
  sleep text check (sleep in ('early', 'flexible', 'late')),
  smokes boolean not null default false,
  has_pets boolean not null default false,
  -- Must-haves applied before ranking.
  wants_smoke_free boolean not null default true,
  accepts_pets boolean not null default true,
  wants_verified_only boolean not null default false,
  -- Lifecycle. `verified` and `is_demo` are never writable by the user.
  onboarded boolean not null default false,
  active boolean not null default true,
  verified boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_budget_order check (budget_max > budget_min),
  constraint profiles_onboarded_complete check (
    not onboarded
    or (
      city is not null and intent is not null
      and budget_min is not null and budget_max is not null
      and move_date is not null and stay_months is not null
      and cleanliness is not null and social is not null and sleep is not null
    )
  )
);
comment on table public.profiles is
  'One row per account. Created by a trigger on auth.users; completed during onboarding.';

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text check (char_length(description) <= 1200),
  price integer not null check (price between 100 and 5000),
  photo_url text check (char_length(photo_url) <= 500),
  city text not null check (char_length(btrim(city)) between 1 and 70),
  neighborhood text check (char_length(neighborhood) <= 70),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rooms_owner_id_idx on public.rooms (owner_id);

create table public.swipes (
  swiper_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  primary key (swiper_id, target_id),
  constraint swipes_not_self check (swiper_id <> target_id)
);
comment on table public.swipes is
  'A like or a pass. Two opposite likes create a row in matches.';
create index swipes_likes_received_idx on public.swipes (target_id)
  where action = 'like';

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Storing the pair in a fixed order makes "one match per pair" a plain
  -- unique constraint.
  constraint matches_ordered_pair check (user_a < user_b),
  constraint matches_unique_pair unique (user_a, user_b)
);
comment on table public.matches is
  'Created only by a trigger when two people like each other; clients cannot write here.';
create index matches_user_b_idx on public.matches (user_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_match_created_idx on public.messages (match_id, created_at);
create index messages_sender_id_idx on public.messages (sender_id);

create table public.conversation_reads (
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index conversation_reads_user_id_idx on public.conversation_reads (user_id);

create table public.saved_rooms (
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, room_id)
);
create index saved_rooms_room_id_idx on public.saved_rooms (room_id);

create table public.moving_plans (
  user_id uuid primary key default auth.uid()
    references public.profiles (id) on delete cascade,
  checklist text[] not null default '{}' check (cardinality(checklist) <= 20),
  notes text not null default '' check (char_length(notes) <= 20000),
  viewing_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
create index blocks_blocked_id_idx on public.blocks (blocked_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (
    reason in ('misleading-profile', 'inappropriate-messages', 'suspicious-listing', 'other')
  ),
  details text check (char_length(details) <= 1000),
  -- Moderators change the status with the service role; users cannot.
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint reports_not_self check (reporter_id <> reported_id)
);
create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_reported_id_idx on public.reports (reported_id);

-- ---------------------------------------------------------------------------
-- Helper functions used by policies.
-- SECURITY DEFINER so a policy can look at rows the caller may not read
-- (for example, whether the other person blocked them).
-- ---------------------------------------------------------------------------

create function private.blocked_between(other uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = other)
       or (b.blocker_id = other and b.blocked_id = (select auth.uid()))
  );
$$;

create function private.is_match_participant(match uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.matches m
    where m.id = match and (select auth.uid()) in (m.user_a, m.user_b)
  );
$$;

create function private.is_matched_with(other uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.matches m
    where m.user_a = least((select auth.uid()), other)
      and m.user_b = greatest((select auth.uid()), other)
  );
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms
  for each row execute function private.set_updated_at();
create trigger moving_plans_set_updated_at before update on public.moving_plans
  for each row execute function private.set_updated_at();

-- Every new account gets a profile row; onboarding fills in the rest.
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(btrim(left(new.raw_user_meta_data ->> 'name', 48)), ''), 'New member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Two opposite likes become a match.
create function private.create_match_on_like()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.action = 'like'
    and exists (
      select 1 from public.swipes s
      where s.swiper_id = new.target_id
        and s.target_id = new.swiper_id
        and s.action = 'like'
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = new.swiper_id and b.blocked_id = new.target_id)
         or (b.blocker_id = new.target_id and b.blocked_id = new.swiper_id)
    )
  then
    insert into public.matches (user_a, user_b)
    values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
    on conflict on constraint matches_unique_pair do nothing;
  end if;
  return new;
end;
$$;

create trigger swipes_create_match after insert or update of action on public.swipes
  for each row execute function private.create_match_on_like();

-- Undoing a like removes the match, unless the two already talked.
create function private.remove_match_on_unlike()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if old.action = 'like' and (tg_op = 'DELETE' or new.action <> 'like') then
    delete from public.matches m
    where m.user_a = least(old.swiper_id, old.target_id)
      and m.user_b = greatest(old.swiper_id, old.target_id)
      and not exists (select 1 from public.messages msg where msg.match_id = m.id);
  end if;
  return null;
end;
$$;

create trigger swipes_remove_match after delete or update of action on public.swipes
  for each row execute function private.remove_match_on_unlike();

-- Blocking ends the match (and its conversation) and clears both swipes.
create function private.apply_block()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.matches m
  where m.user_a = least(new.blocker_id, new.blocked_id)
    and m.user_b = greatest(new.blocker_id, new.blocked_id);
  delete from public.swipes s
  where (s.swiper_id = new.blocker_id and s.target_id = new.blocked_id)
     or (s.swiper_id = new.blocked_id and s.target_id = new.blocker_id);
  return new;
end;
$$;

create trigger blocks_apply after insert on public.blocks
  for each row execute function private.apply_block();

-- ---------------------------------------------------------------------------
-- Privileges: start from nothing, then grant exactly what the app needs.
-- Column-level grants keep server-owned columns (ids, timestamps, verified,
-- is_demo, report status) out of reach even for the row's owner.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function
  private.blocked_between(uuid),
  private.is_match_participant(uuid),
  private.is_matched_with(uuid)
to authenticated;

grant select on public.profiles to authenticated;
grant update (
  name, age, occupation, university, city, neighborhood, bio, photo_url, photos,
  tags, prompt_question, prompt_answer, intent, budget_min, budget_max, move_date,
  stay_months, cleanliness, social, sleep, smokes, has_pets, wants_smoke_free,
  accepts_pets, wants_verified_only, onboarded, active
) on public.profiles to authenticated;

grant select, delete on public.rooms to authenticated;
grant insert (title, description, price, photo_url, city, neighborhood, available, owner_id)
  on public.rooms to authenticated;
grant update (title, description, price, photo_url, city, neighborhood, available)
  on public.rooms to authenticated;

grant select, delete on public.swipes to authenticated;
grant insert (target_id, action) on public.swipes to authenticated;
grant update (action) on public.swipes to authenticated;

grant select on public.matches to authenticated;

grant select on public.messages to authenticated;
grant insert (match_id, body) on public.messages to authenticated;

grant select on public.conversation_reads to authenticated;
grant insert (match_id, last_read_at) on public.conversation_reads to authenticated;
grant update (last_read_at) on public.conversation_reads to authenticated;

grant select, delete on public.saved_rooms to authenticated;
grant insert (room_id) on public.saved_rooms to authenticated;

grant select on public.moving_plans to authenticated;
grant insert (checklist, notes, viewing_at) on public.moving_plans to authenticated;
grant update (checklist, notes, viewing_at) on public.moving_plans to authenticated;

grant select, delete on public.blocks to authenticated;
grant insert (blocked_id) on public.blocks to authenticated;

grant select on public.reports to authenticated;
grant insert (reported_id, reason, details) on public.reports to authenticated;

grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;
alter table public.saved_rooms enable row level security;
alter table public.moving_plans enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- Profiles: your own row always; other people only once they finished
-- onboarding and are searching, never across a block. A match keeps the
-- other person visible even if they pause their search.
create policy "Members read visible profiles" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (
      not private.blocked_between(id)
      and ((onboarded and active) or private.is_matched_with(id))
    )
  );

create policy "Members update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Rooms: available listings, never across a block; owners manage their own.
create policy "Members read available rooms" on public.rooms
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (available and not private.blocked_between(owner_id))
  );

create policy "Owners add their rooms" on public.rooms
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners update their rooms" on public.rooms
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners delete their rooms" on public.rooms
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Swipes: you see what you sent and the likes you received (never passes).
create policy "Members read their swipes and received likes" on public.swipes
  for select to authenticated
  using (
    swiper_id = (select auth.uid())
    or (target_id = (select auth.uid()) and action = 'like')
  );

create policy "Members swipe as themselves" on public.swipes
  for insert to authenticated
  with check (
    swiper_id = (select auth.uid())
    and not private.blocked_between(target_id)
  );

create policy "Members change their own swipe" on public.swipes
  for update to authenticated
  using (swiper_id = (select auth.uid()))
  with check (swiper_id = (select auth.uid()));

create policy "Members undo their own swipe" on public.swipes
  for delete to authenticated
  using (swiper_id = (select auth.uid()));

-- Matches: read-only for the two people in it.
create policy "Participants read their matches" on public.matches
  for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));

-- Messages: only inside your own matches, only as yourself, never edited.
create policy "Participants read messages" on public.messages
  for select to authenticated
  using (private.is_match_participant(match_id));

create policy "Participants send messages as themselves" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and private.is_match_participant(match_id)
  );

create policy "Members read their read markers" on public.conversation_reads
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Participants add their read marker" on public.conversation_reads
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_match_participant(match_id)
  );

create policy "Members update their read marker" on public.conversation_reads
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Private planning data: strictly per user.
create policy "Members read their saved rooms" on public.saved_rooms
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members save rooms for themselves" on public.saved_rooms
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Members unsave their rooms" on public.saved_rooms
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Members read their moving plan" on public.moving_plans
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Members create their moving plan" on public.moving_plans
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Members update their moving plan" on public.moving_plans
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Blocks and reports: visible only to the person who made them.
create policy "Members read their blocks" on public.blocks
  for select to authenticated using (blocker_id = (select auth.uid()));
create policy "Members block as themselves" on public.blocks
  for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "Members remove their blocks" on public.blocks
  for delete to authenticated using (blocker_id = (select auth.uid()));

create policy "Members read their reports" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));
create policy "Members report as themselves" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
