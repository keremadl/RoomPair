-- Security, authorization, storage and concurrency hardening across profiles,
-- rooms, matches, messages, moderation, storage buckets and account lifecycle.

-- ---------------------------------------------------------------------------
-- 1. Array, JSONB and adult-onboarding integrity constraints (H2, H4)
-- ---------------------------------------------------------------------------

create or replace function private.valid_text_array(
  items text[],
  max_items integer,
  max_len integer
)
returns boolean
language sql immutable set search_path = ''
as $$
  select items is not null
    and cardinality(items) <= max_items
    and array_position(items, null) is null
    and not exists (
      select 1
      from unnest(items) as item
      where char_length(btrim(item)) = 0
         or char_length(item) > max_len
    );
$$;

create or replace function private.valid_prompts(items jsonb)
returns boolean
language sql immutable set search_path = ''
as $$
  select items is not null
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) <= 3
    and not exists (
      select 1
      from jsonb_array_elements(items) as elem
      where jsonb_typeof(elem) <> 'object'
         or jsonb_typeof(elem -> 'question') <> 'string'
         or jsonb_typeof(elem -> 'answer') <> 'string'
         or char_length(btrim(elem ->> 'question')) not between 1 and 160
         or char_length(btrim(elem ->> 'answer')) not between 1 and 400
    );
$$;

-- Clean any malformed legacy array/jsonb elements before enforcing checks.
update public.profiles
set photos = coalesce(
      array(
        select item from unnest(photos) as item
        where item is not null and char_length(btrim(item)) between 1 and 500
        limit 6
      ),
      '{}'::text[]
    ),
    tags = coalesce(
      array(
        select item from unnest(tags) as item
        where item is not null and char_length(btrim(item)) between 1 and 40
        limit 8
      ),
      '{}'::text[]
    ),
    languages = coalesce(
      array(
        select item from unnest(languages) as item
        where item is not null and char_length(btrim(item)) between 1 and 40
        limit 12
      ),
      '{}'::text[]
    ),
    prompts = coalesce(
      (
        select jsonb_agg(elem)
        from (
          select elem
          from jsonb_array_elements(
            case when jsonb_typeof(prompts) = 'array' then prompts else '[]'::jsonb end
          ) as elem
          where jsonb_typeof(elem) = 'object'
            and jsonb_typeof(elem -> 'question') = 'string'
            and jsonb_typeof(elem -> 'answer') = 'string'
            and char_length(btrim(elem ->> 'question')) between 1 and 160
            and char_length(btrim(elem ->> 'answer')) between 1 and 400
          limit 3
        ) as valid_elems
      ),
      '[]'::jsonb
    );

update public.rooms
set photos = coalesce(
      array(
        select item from unnest(photos) as item
        where item is not null and char_length(btrim(item)) between 1 and 500
        limit 6
      ),
      '{}'::text[]
    );

-- Align maximum age (18..99) between database and UI, and require adult age +
-- at least one photo before a real member can be marked onboarded.
alter table public.profiles
  drop constraint if exists profiles_age_check,
  add constraint profiles_age_check check (age between 18 and 99),
  drop constraint if exists profiles_photos_check,
  add constraint profiles_photos_check check (private.valid_text_array(photos, 6, 500)),
  drop constraint if exists profiles_tags_check,
  add constraint profiles_tags_check check (private.valid_text_array(tags, 8, 40)),
  drop constraint if exists profiles_languages_check,
  add constraint profiles_languages_check check (private.valid_text_array(languages, 12, 40)),
  drop constraint if exists profiles_prompts_check,
  add constraint profiles_prompts_check check (private.valid_prompts(prompts)),
  drop constraint if exists profiles_onboarded_complete,
  add constraint profiles_onboarded_complete check (
    not onboarded
    or (
      city is not null and intent is not null
      and budget_min is not null and budget_max is not null
      and move_date is not null and stay_months is not null
      and cleanliness is not null and social is not null and sleep is not null
      and (is_demo or (age is not null and cardinality(photos) >= 1))
    )
  );

alter table public.rooms
  drop constraint if exists rooms_photos_check,
  add constraint rooms_photos_check check (private.valid_text_array(photos, 6, 500));

create or replace function public.set_birth_date(birth date)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  years integer := private.age_on(birth, current_date);
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  if birth is null or years < 18 or years > 99 then
    raise exception 'You need to be 18 or older.' using errcode = '23514';
  end if;
  insert into private.birth_dates (user_id, birth_date)
  values ((select auth.uid()), birth)
  on conflict (user_id) do update set birth_date = excluded.birth_date;
  update public.profiles set age = years where id = (select auth.uid());
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Private filter columns & helper RPCs (M3, M11, L9)
-- ---------------------------------------------------------------------------

-- Filter preferences belong to the member alone; other members do not read them.
-- PostgreSQL requires revoking the table-level SELECT grant first, then granting
-- column-level SELECT on the non-private columns only.
revoke select on public.profiles from authenticated;
grant select (
  id, name, age, status, occupation, university, languages, gender,
  city, neighborhood, bio, photo_url, photos, tags, prompts, intent,
  budget_min, budget_max, move_date, stay_months,
  cleanliness, social, sleep, guests, home_days, noise, sharing,
  smokes, has_pets, onboarded, active, verified, is_demo,
  demo_likes_newcomers, created_at, updated_at
) on public.profiles to authenticated;

create or replace function public.my_filter_preferences()
returns table (
  wants_smoke_free boolean,
  accepts_pets boolean,
  wants_verified_only boolean,
  living_with text
)
language sql stable security definer set search_path = ''
as $$
  select p.wants_smoke_free, p.accepts_pets, p.wants_verified_only, p.living_with
  from public.profiles p
  where p.id = (select auth.uid());
$$;

-- Minimal blocked-member directory (id + first name only) so members can
-- unblock people in account mode even though RLS hides blocked profiles.
create or replace function public.my_blocks()
returns table (
  blocked_id uuid,
  blocked_name text
)
language sql stable security definer set search_path = ''
as $$
  select b.blocked_id, coalesce(p.name, 'Member')
  from public.blocks b
  left join public.profiles p on p.id = b.blocked_id
  where b.blocker_id = (select auth.uid())
  order by b.created_at desc;
$$;

-- Server-timestamped atomic read marker so client clock skew cannot hide unreads.
create or replace function public.mark_conversation_read(p_match uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.is_match_participant(p_match) then
    raise exception 'Not a participant in this conversation.' using errcode = '42501';
  end if;
  insert into public.conversation_reads (match_id, user_id, last_read_at)
  values (p_match, (select auth.uid()), now())
  on conflict (match_id, user_id) do update set last_read_at = now();
end;
$$;

-- Lists all chat photo paths owned by the caller, including from ended matches.
create or replace function public.my_chat_photo_paths()
returns table (path text)
language sql stable security definer set search_path = ''
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'chat-photos'
    and o.owner_id = (select auth.uid())::text;
$$;

-- ---------------------------------------------------------------------------
-- 3. Active-member & suspension enforcement across tables (H4, M1, M4, M5, L3)
-- ---------------------------------------------------------------------------

create or replace function private.caller_is_active_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and not private.is_suspended(p.id)
  );
$$;

create or replace function private.caller_can_browse()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.onboarded
      and p.age is not null
      and not private.is_suspended(p.id)
  );
$$;

drop policy if exists "Members read visible profiles" on public.profiles;
create policy "Members read visible profiles" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (
      private.caller_can_browse()
      and not private.blocked_between(id)
      and not private.is_suspended(id)
      and ((onboarded and active) or private.is_matched_with(id))
    )
  );

drop policy if exists "Members update their own profile" on public.profiles;
create policy "Members update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and not private.is_suspended(id))
  with check (id = (select auth.uid()) and not private.is_suspended(id));

drop policy if exists "Members read available rooms" on public.rooms;
create policy "Members read available rooms" on public.rooms
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (
      private.caller_can_browse()
      and available
      and not private.blocked_between(owner_id)
      and not private.is_suspended(owner_id)
      and exists (
        select 1
        from public.profiles host
        where host.id = owner_id
          and host.intent = 'have-room'
          and ((host.onboarded and host.active) or private.is_matched_with(owner_id))
      )
    )
  );

drop policy if exists "Owners add their rooms" on public.rooms;
create policy "Owners add their rooms" on public.rooms
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and private.caller_is_active_member());

drop policy if exists "Owners update their rooms" on public.rooms;
create policy "Owners update their rooms" on public.rooms
  for update to authenticated
  using (owner_id = (select auth.uid()) and private.caller_is_active_member())
  with check (owner_id = (select auth.uid()) and private.caller_is_active_member());

drop policy if exists "Members read their swipes and received likes" on public.swipes;
create policy "Members read their swipes and received likes" on public.swipes
  for select to authenticated
  using (
    private.caller_is_active_member()
    and (
      swiper_id = (select auth.uid())
      or (target_id = (select auth.uid()) and action = 'like')
    )
  );

drop policy if exists "Members swipe as themselves" on public.swipes;
create policy "Members swipe as themselves" on public.swipes
  for insert to authenticated
  with check (
    swiper_id = (select auth.uid())
    and private.caller_can_browse()
    and not private.blocked_between(target_id)
    and not private.is_suspended(target_id)
  );

drop policy if exists "Members change their own swipe" on public.swipes;
create policy "Members change their own swipe" on public.swipes
  for update to authenticated
  using (swiper_id = (select auth.uid()) and private.caller_can_browse())
  with check (
    swiper_id = (select auth.uid())
    and private.caller_can_browse()
    and not private.blocked_between(target_id)
    and not private.is_suspended(target_id)
  );

drop policy if exists "Participants read their matches" on public.matches;
create policy "Participants read their matches" on public.matches
  for select to authenticated
  using (
    private.caller_is_active_member()
    and (select auth.uid()) in (user_a, user_b)
    and not private.is_suspended(case when user_a = (select auth.uid()) then user_b else user_a end)
  );

-- Allow passing explicit UUID id on messages for idempotent client retries (M8).
grant insert (id) on public.messages to authenticated;

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages" on public.messages
  for select to authenticated
  using (
    private.caller_is_active_member()
    and exists (
      select 1
      from public.matches m
      where m.id = match_id
        and (select auth.uid()) in (m.user_a, m.user_b)
        and not private.blocked_between(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
        and not private.is_suspended(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
    )
  );

drop policy if exists "Participants send messages as themselves" on public.messages;
create policy "Participants send messages as themselves" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and private.caller_can_browse()
    and exists (
      select 1
      from public.matches m
      where m.id = match_id
        and (select auth.uid()) in (m.user_a, m.user_b)
        and not private.blocked_between(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
        and not private.is_suspended(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
    )
  );

drop policy if exists "Members save rooms for themselves" on public.saved_rooms;
create policy "Members save rooms for themselves" on public.saved_rooms
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.caller_can_browse()
    and exists (select 1 from public.rooms r where r.id = room_id)
  );

-- ---------------------------------------------------------------------------
-- 4. Pair-level serialization for likes & blocks (M2)
-- ---------------------------------------------------------------------------

create or replace function private.lock_member_pair(a uuid, b uuid)
returns void
language sql volatile set search_path = ''
as $$
  select pg_advisory_xact_lock(
    hashtextextended(least(a, b)::text || ':' || greatest(a, b)::text, 0)
  );
$$;

create or replace function private.create_match_on_like()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform private.lock_member_pair(new.swiper_id, new.target_id);
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
    and not private.is_suspended(new.swiper_id)
    and not private.is_suspended(new.target_id)
  then
    insert into public.matches (user_a, user_b)
    values (least(new.swiper_id, new.target_id), greatest(new.swiper_id, new.target_id))
    on conflict on constraint matches_unique_pair do nothing;
  end if;
  return new;
end;
$$;

create or replace function private.apply_block()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform private.lock_member_pair(new.blocker_id, new.blocked_id);
  delete from public.matches m
  where m.user_a = least(new.blocker_id, new.blocked_id)
    and m.user_b = greatest(new.blocker_id, new.blocked_id);
  delete from public.swipes s
  where (s.swiper_id = new.blocker_id and s.target_id = new.blocked_id)
     or (s.swiper_id = new.blocked_id and s.target_id = new.blocker_id);
  return new;
end;
$$;

create or replace function private.demo_likes_newcomer()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.onboarded and not old.onboarded and not new.is_demo then
    insert into public.swipes (swiper_id, target_id, action)
    select p.id, new.id, 'like'
    from public.profiles p
    where p.is_demo
      and p.demo_likes_newcomers
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = p.id and b.blocked_id = new.id)
           or (b.blocker_id = new.id and b.blocked_id = p.id)
      )
    on conflict (swiper_id, target_id) do nothing;
  end if;
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Storage bucket settings, published-photo visibility & quotas (H1, M15)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('chat-photos', 'chat-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.can_read_profile_photo(object_name text)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  owner uuid := private.folder_id(object_name);
begin
  if owner is null then
    return false;
  end if;
  if owner = (select auth.uid()) then
    return exists (select 1 from public.profiles p where p.id = owner);
  end if;
  if not private.caller_can_browse()
    or private.blocked_between(owner)
    or private.is_suspended(owner)
  then
    return false;
  end if;
  return exists (
    select 1
    from public.profiles p
    where p.id = owner
      and ((p.onboarded and p.active) or private.is_matched_with(owner))
      and object_name = any(p.photos)
  ) or exists (
    select 1
    from public.rooms r
    join public.profiles host on host.id = r.owner_id
    where r.owner_id = owner
      and r.available
      and host.intent = 'have-room'
      and ((host.onboarded and host.active) or private.is_matched_with(owner))
      and object_name = any(r.photos)
  );
end;
$$;

create or replace function private.folder_object_count(p_bucket text, p_folder uuid)
returns bigint
language sql stable security definer set search_path = ''
as $$
  select count(*)
  from storage.objects o
  where o.bucket_id = p_bucket
    and private.folder_id(o.name) = p_folder;
$$;

drop policy if exists "Members read profile photos" on storage.objects;
create policy "Members read profile photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and private.can_read_profile_photo(name)
  );

drop policy if exists "Members add their own profile photos" on storage.objects;
create policy "Members add their own profile photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and private.caller_is_active_member()
    and private.folder_id(name) = (select auth.uid())
    and private.folder_object_count('profile-photos', (select auth.uid())) < 24
  );

drop policy if exists "Participants read chat photos" on storage.objects;
create policy "Participants read chat photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-photos'
    and private.caller_is_active_member()
    and private.folder_id(name) is not null
    and exists (
      select 1
      from public.matches m
      where m.id = private.folder_id(name)
        and (select auth.uid()) in (m.user_a, m.user_b)
        and not private.blocked_between(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
        and not private.is_suspended(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
    )
  );

drop policy if exists "Participants add chat photos" on storage.objects;
create policy "Participants add chat photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-photos'
    and private.caller_can_browse()
    and private.folder_id(name) is not null
    and private.folder_object_count('chat-photos', private.folder_id(name)) < 200
    and exists (
      select 1
      from public.matches m
      where m.id = private.folder_id(name)
        and (select auth.uid()) in (m.user_a, m.user_b)
        and not private.blocked_between(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
        and not private.is_suspended(case when m.user_a = (select auth.uid()) then m.user_b else m.user_a end)
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Report deduplication, review audit & session-pinned account deletion (H3, H5, M12)
-- ---------------------------------------------------------------------------

-- Keep only the newest open report per (reporter, reported, reason) before adding the unique index.
delete from public.reports r
using public.reports newer
where r.status = 'open'
  and newer.status = 'open'
  and r.reporter_id = newer.reporter_id
  and r.reported_id = newer.reported_id
  and r.reason = newer.reason
  and r.created_at < newer.created_at;

create unique index if not exists reports_open_unique_idx
  on public.reports (reporter_id, reported_id, reason)
  where status = 'open';

alter table public.reports
  add column if not exists reviewed_by uuid references auth.users (id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create or replace function public.review_report(
  report uuid,
  outcome text,
  suspend boolean default false
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  member uuid;
begin
  if not private.is_moderator() then
    raise exception 'Only moderators can review reports.' using errcode = '42501';
  end if;
  if outcome not in ('reviewed', 'dismissed') then
    raise exception 'Unknown outcome.' using errcode = '23514';
  end if;
  update public.reports
  set status = outcome,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = report
    and status = 'open'
  returning reported_id into member;
  if member is null then
    raise exception 'Open report not found.' using errcode = 'P0002';
  end if;
  if suspend then
    insert into private.suspended_members (user_id, suspended_by)
    values (member, (select auth.uid()))
    on conflict (user_id) do nothing;
  end if;
end;
$$;

drop function if exists public.delete_account();
create function public.delete_account(expected_user uuid default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  if expected_user is not null and expected_user <> uid then
    raise exception 'Session changed; account deletion cancelled.' using errcode = '42501';
  end if;
  -- Allow server-side cleanup of any remaining storage rows owned by the member
  -- (including chat photos from matches removed earlier by blocks).
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects
  where (bucket_id = 'profile-photos' and private.folder_id(name) = uid)
     or (bucket_id = 'chat-photos' and owner_id = uid::text);
  delete from auth.users where id = uid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Realtime publication narrowed to INSERT only & explicit function ACLs (L1)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime set (publish = 'insert');
  end if;
end $$;

-- Explicit deny-all policies on private tables (accessed only via SECURITY DEFINER functions).
drop policy if exists "No direct access" on private.birth_dates;
create policy "No direct access" on private.birth_dates
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "No direct access" on private.moderators;
create policy "No direct access" on private.moderators
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "No direct access" on private.suspended_members;
create policy "No direct access" on private.suspended_members
  for all to anon, authenticated using (false) with check (false);

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.blocked_between(uuid),
  private.is_match_participant(uuid),
  private.is_matched_with(uuid),
  private.folder_id(text),
  private.is_moderator(),
  private.is_suspended(uuid),
  private.age_on(date, date),
  private.valid_text_array(text[], integer, integer),
  private.valid_prompts(jsonb),
  private.caller_is_active_member(),
  private.caller_can_browse(),
  private.lock_member_pair(uuid, uuid),
  private.can_read_profile_photo(text),
  private.folder_object_count(text, uuid)
to authenticated;

revoke all on function public.my_filter_preferences() from public, anon;
revoke all on function public.my_blocks() from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.my_chat_photo_paths() from public, anon;
revoke all on function public.delete_account(uuid) from public, anon;
revoke all on function public.review_report(uuid, text, boolean) from public, anon;
revoke all on function public.set_birth_date(date) from public, anon;
grant execute on function
  public.my_filter_preferences(),
  public.my_blocks(),
  public.mark_conversation_read(uuid),
  public.my_chat_photo_paths(),
  public.delete_account(uuid),
  public.review_report(uuid, text, boolean),
  public.set_birth_date(date)
to authenticated;
