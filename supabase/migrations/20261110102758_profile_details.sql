-- Catch the schema up with the redesigned profile: more about how people
-- live, up to three prompts, richer room listings, one room per host, and
-- photos in chat. Photo files live in Storage (next migration); the tables
-- only keep their paths.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column status text check (status in ('student', 'working')),
  add column languages text[] not null default '{}'
    check (cardinality(languages) <= 12),
  add column gender text check (gender in ('woman', 'man', 'nonbinary')),
  add column guests text check (guests in ('rarely', 'sometimes', 'often')),
  add column home_days text check (home_days in ('rarely', 'sometimes', 'often')),
  add column noise text check (noise in ('low', 'medium', 'high')),
  add column sharing text check (sharing in ('separate', 'some', 'most')),
  -- [{ "question": "...", "answer": "..." }], at most three.
  add column prompts jsonb not null default '[]'
    check (jsonb_typeof(prompts) = 'array' and jsonb_array_length(prompts) <= 3),
  -- Who the member would like to live with; people who did not state a
  -- gender only appear for "anyone".
  add column living_with text not null default 'anyone'
    check (living_with in ('anyone', 'women', 'men'));

comment on column public.profiles.gender is
  'Optional. Used only for the "who you would like to live with" filter.';

-- The single prompt of the first schema becomes the first of the list.
update public.profiles
set prompts = jsonb_build_array(
  jsonb_build_object('question', prompt_question, 'answer', prompt_answer)
)
where prompt_question is not null and prompt_answer is not null;

alter table public.profiles
  drop column prompt_question,
  drop column prompt_answer;

grant update (
  status, languages, gender, guests, home_days, noise, sharing, prompts, living_with
) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Rooms: the details a newcomer asks about, and one listing per host.
-- ---------------------------------------------------------------------------
alter table public.rooms
  add column photos text[] not null default '{}' check (cardinality(photos) <= 6),
  add column bills_included boolean not null default false,
  add column deposit integer not null default 0 check (deposit between 0 and 20000),
  add column private_bathroom boolean not null default false,
  add column furnished boolean not null default true,
  -- People already living there, not counting the newcomer.
  add column flatmates smallint not null default 0 check (flatmates between 0 and 20),
  add column transport text check (char_length(transport) <= 120),
  add column house_rules text check (char_length(house_rules) <= 400),
  add constraint rooms_one_per_owner unique (owner_id);

-- The unique constraint above already indexes owner_id.
drop index public.rooms_owner_id_idx;

grant insert (
  photos, bills_included, deposit, private_bathroom, furnished, flatmates,
  transport, house_rules
) on public.rooms to authenticated;
grant update (
  photos, bills_included, deposit, private_bathroom, furnished, flatmates,
  transport, house_rules
) on public.rooms to authenticated;

-- ---------------------------------------------------------------------------
-- Messages may carry a photo; then the text is optional.
-- ---------------------------------------------------------------------------
alter table public.messages
  add column photo_path text check (char_length(photo_path) <= 300),
  drop constraint messages_body_check,
  add constraint messages_body_check check (
    char_length(body) <= 2000
    and (char_length(btrim(body)) >= 1 or photo_path is not null)
  );

grant insert (photo_path) on public.messages to authenticated;
