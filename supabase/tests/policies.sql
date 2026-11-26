-- Authorization tests for the RoomPair schema. Each block signs in as a member
-- and asserts what they can and cannot do. Everything runs in one transaction
-- that is rolled back, so the script is safe on any database with the schema.
--
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/policies.sql
--
-- A failed assertion aborts the script with the message of the broken rule.

begin;

-- Three members: Ada and Ben will match; Cem is an outsider.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ada@test.roompair.example', '{"name": "Ada"}'),
  ('22222222-2222-4222-8222-222222222222', 'ben@test.roompair.example', '{"name": "Ben"}'),
  ('33333333-3333-4333-8333-333333333333', 'cem@test.roompair.example', '{}');

create function pg_temp.sign_in(member text) returns void language sql as $$
  select set_config(
    'request.jwt.claims',
    json_build_object('role', 'authenticated', 'sub', case member
      when 'ada' then '11111111-1111-4111-8111-111111111111'
      when 'ben' then '22222222-2222-4222-8222-222222222222'
      when 'cem' then '33333333-3333-4333-8333-333333333333'
    end)::text,
    true
  );
$$;
grant execute on function pg_temp.sign_in(text) to authenticated, anon;

-- Runs a statement that must be rejected, by privileges, a policy or a constraint.
create function pg_temp.must_fail(statement text, rule text) returns void
language plpgsql as $$
declare
  affected bigint;
begin
  begin
    execute statement;
    get diagnostics affected = row_count;
  exception when insufficient_privilege or check_violation or unique_violation
    or foreign_key_violation or not_null_violation then
    return;
  end;
  -- Policies hide rows instead of raising, so "nothing changed" also passes.
  if affected > 0 then
    raise exception 'RULE BROKEN: %', rule;
  end if;
end;
$$;
grant execute on function pg_temp.must_fail(text, text) to authenticated, anon;

do $$
begin
  assert (select count(*) from public.profiles
          where id::text like '________-____-4___-8___-%' and name in ('Ada', 'Ben', 'New member')) = 3,
    'sign-up creates one profile per account, named from metadata or a default';
end $$;

-- ---------------------------------------------------------------------------
-- Signed-out visitors see nothing.
-- ---------------------------------------------------------------------------
set local role anon;
select pg_temp.must_fail('select 1 from public.profiles limit 1', 'signed-out visitors cannot read profiles');
select pg_temp.must_fail('select 1 from public.messages limit 1', 'signed-out visitors cannot read messages');
select pg_temp.must_fail('select 1 from public.rooms limit 1', 'signed-out visitors cannot read rooms');
reset role;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
set local role authenticated;
select pg_temp.sign_in('ada');
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ben') = 0,
    'a profile that has not finished onboarding is hidden from others';
  assert (select count(*) from public.profiles where name = 'Ada') = 1,
    'members always see their own profile';
end $$;

select pg_temp.must_fail(
  $$update public.profiles set
      city = 'Riga', intent = 'find-room', budget_min = 350, budget_max = 650,
      move_date = current_date + 30, stay_months = 12, cleanliness = 4, social = 4,
      sleep = 'flexible', photos = array['11111111-1111-4111-8111-111111111111/ada.jpg'],
      onboarded = true
    where id = '11111111-1111-4111-8111-111111111111'$$,
  'onboarding requires a verified adult date of birth');

select public.set_birth_date((current_date - interval '23 years')::date);
select pg_temp.must_fail(
  $$update public.profiles set
      city = 'Riga', intent = 'find-room', budget_min = 350, budget_max = 650,
      move_date = current_date + 30, stay_months = 12, cleanliness = 4, social = 4,
      sleep = 'flexible', photos = '{}', onboarded = true
    where id = '11111111-1111-4111-8111-111111111111'$$,
  'onboarding requires at least one profile photo');

insert into storage.objects (bucket_id, name)
values ('profile-photos', '11111111-1111-4111-8111-111111111111/ada.jpg');

update public.profiles set
  city = 'Riga', intent = 'find-room', budget_min = 350, budget_max = 650,
  move_date = current_date + 30, stay_months = 12, cleanliness = 4, social = 4,
  sleep = 'flexible', photos = array['11111111-1111-4111-8111-111111111111/ada.jpg'],
  onboarded = true
where id = '11111111-1111-4111-8111-111111111111';

select pg_temp.must_fail(
  $$update public.profiles set photos = array[null]::text[] where id = '11111111-1111-4111-8111-111111111111'$$,
  'null elements inside photo arrays are rejected');
select pg_temp.must_fail(
  $$update public.profiles set prompts = '[null]' where id = '11111111-1111-4111-8111-111111111111'$$,
  'malformed prompt items are rejected');

select pg_temp.must_fail(
  $$update public.profiles set verified = true where id = '11111111-1111-4111-8111-111111111111'$$,
  'members cannot verify themselves');
select pg_temp.must_fail(
  $$update public.profiles set is_demo = true where id = '11111111-1111-4111-8111-111111111111'$$,
  'members cannot mark themselves as demo accounts');
select pg_temp.must_fail(
  $$update public.profiles set name = 'Hacked' where id = '22222222-2222-4222-8222-222222222222'$$,
  'members cannot edit someone else''s profile');
select pg_temp.must_fail(
  $$update public.profiles set budget_min = 900, budget_max = 400 where id = '11111111-1111-4111-8111-111111111111'$$,
  'the maximum budget must be above the minimum');
select pg_temp.must_fail(
  $$update public.profiles set age = 16 where id = '11111111-1111-4111-8111-111111111111'$$,
  'members must be adults');
select pg_temp.must_fail(
  $$delete from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
  'profiles are removed with the account, not through the API');

select pg_temp.sign_in('ben');
select pg_temp.must_fail(
  $$update public.profiles set onboarded = true where id = '22222222-2222-4222-8222-222222222222'$$,
  'onboarding cannot be completed with missing answers');
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ada') = 0,
    'a member who has not finished onboarding cannot browse other profiles yet';
end $$;
select public.set_birth_date((current_date - interval '24 years')::date);
update public.profiles set
  city = 'Riga', intent = 'have-room', budget_min = 300, budget_max = 600,
  move_date = current_date + 35, stay_months = 12, cleanliness = 4, social = 3,
  sleep = 'early', photos = array['22222222-2222-4222-8222-222222222222/me.jpg'],
  onboarded = true
where id = '22222222-2222-4222-8222-222222222222';
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ada') = 1,
    'onboarded, active profiles are visible to other members';
end $$;
select pg_temp.must_fail(
  $$select living_with from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
  'private filter preferences are not readable from profiles');
update public.profiles set living_with = 'anyone', wants_smoke_free = true
  where id = '22222222-2222-4222-8222-222222222222';
do $$
begin
  assert (select count(*) from public.my_filter_preferences()) = 1,
    'members read their own filter preferences via RPC';
end $$;

-- ---------------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------------
insert into public.rooms (owner_id, title, price, city)
values ('22222222-2222-4222-8222-222222222222', 'Ben''s spare room', 420, 'Riga');
select pg_temp.must_fail(
  $$insert into public.rooms (owner_id, title, price, city)
    values ('11111111-1111-4111-8111-111111111111', 'Fake listing', 300, 'Riga')$$,
  'members cannot list a room in someone else''s name');

select pg_temp.must_fail(
  $$insert into public.rooms (owner_id, title, price, city)
    values ('22222222-2222-4222-8222-222222222222', 'A second listing', 500, 'Riga')$$,
  'a host has one room listing');
update public.rooms set
  deposit = 400, bills_included = true, flatmates = 1,
  photos = array['22222222-2222-4222-8222-222222222222/room.jpg']
where title = 'Ben''s spare room';
select pg_temp.must_fail(
  $$update public.profiles set prompts = '[{},{},{},{}]'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  'a profile has at most three prompts');
select pg_temp.must_fail(
  $$update public.profiles set living_with = 'nobody'
    where id = '22222222-2222-4222-8222-222222222222'$$,
  'living-with preference comes from a fixed list');

-- Profile photos: only inside your own folder, and only published photos are visible to others.
insert into storage.objects (bucket_id, name) values
  ('profile-photos', '22222222-2222-4222-8222-222222222222/me.jpg'),
  ('profile-photos', '22222222-2222-4222-8222-222222222222/draft.jpg');
select pg_temp.must_fail(
  $$insert into storage.objects (bucket_id, name)
    values ('profile-photos', '11111111-1111-4111-8111-111111111111/fake.jpg')$$,
  'members cannot upload into someone else''s photo folder');
select pg_temp.must_fail(
  $$insert into storage.objects (bucket_id, name) values ('profile-photos', 'loose.jpg')$$,
  'photos must live in a member folder');

select pg_temp.sign_in('ada');
do $$
begin
  assert (select count(*) from storage.objects where name like '22222222%') = 1,
    'members can view another member''s published profile photos, never unpublished drafts';
end $$;
select pg_temp.must_fail(
  $$delete from storage.objects where name like '22222222%'$$,
  'members cannot delete someone else''s photos');
do $$
begin
  assert (select count(*) from public.rooms where title = 'Ben''s spare room') = 1,
    'available rooms are visible to members';
end $$;
select pg_temp.must_fail(
  $$update public.rooms set price = 100 where title = 'Ben''s spare room'$$,
  'only the owner can edit a room');
select pg_temp.must_fail(
  $$delete from public.rooms where title = 'Ben''s spare room'$$,
  'only the owner can delete a room');
insert into public.saved_rooms (room_id) select id from public.rooms where title = 'Ben''s spare room';
insert into public.moving_plans (notes, checklist) values ('Ask about the balcony', array['budget']);

select pg_temp.sign_in('cem');
do $$
begin
  assert (select count(*) from public.saved_rooms) = 0, 'saved rooms are private';
  assert (select count(*) from public.moving_plans) = 0, 'moving plans are private';
end $$;
select pg_temp.must_fail(
  $$update public.moving_plans set notes = 'Hacked'$$,
  'members cannot edit someone else''s moving plan');

-- ---------------------------------------------------------------------------
-- Likes and matches
-- ---------------------------------------------------------------------------
select pg_temp.sign_in('ada');
insert into public.swipes (target_id, action) values ('22222222-2222-4222-8222-222222222222', 'like');
select pg_temp.must_fail(
  $$insert into public.swipes (swiper_id, target_id, action)
    values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'like')$$,
  'members cannot like on someone else''s behalf');
select pg_temp.must_fail(
  $$insert into public.swipes (target_id, action) values ('11111111-1111-4111-8111-111111111111', 'like')$$,
  'members cannot like themselves');
select pg_temp.must_fail(
  $$insert into public.matches (user_a, user_b)
    values ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333')$$,
  'members cannot create a match directly');
do $$
begin
  assert (select count(*) from public.matches) = 0, 'a one-sided like is not a match';
end $$;

select pg_temp.sign_in('cem');
do $$
begin
  assert (select count(*) from public.swipes) = 0, 'other people''s likes are not visible';
end $$;

select pg_temp.sign_in('ben');
do $$
begin
  assert (select count(*) from public.swipes
          where target_id = '22222222-2222-4222-8222-222222222222'
            and swiper_id = '11111111-1111-4111-8111-111111111111') = 1,
    'members see the likes they received';
end $$;
insert into public.swipes (target_id, action) values ('33333333-3333-4333-8333-333333333333', 'pass');
insert into public.swipes (target_id, action) values ('11111111-1111-4111-8111-111111111111', 'like');
do $$
begin
  assert (select count(*) from public.matches) = 1, 'two opposite likes create exactly one match';
end $$;

select pg_temp.sign_in('cem');
do $$
begin
  assert (select count(*) from public.swipes) = 0, 'a pass is never shown to the person passed on';
  assert (select count(*) from public.matches) = 0, 'matches are visible only to the two people in them';
end $$;

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------
select pg_temp.sign_in('ada');
insert into public.messages (match_id, body) select id, 'Hello Ben' from public.matches;
select pg_temp.must_fail(
  $$insert into public.messages (match_id, body, sender_id)
    select id, 'Forged', '22222222-2222-4222-8222-222222222222' from public.matches$$,
  'members cannot send a message as someone else');
select pg_temp.must_fail(
  $$insert into public.messages (match_id, body) select id, '   ' from public.matches$$,
  'empty messages are rejected');
select pg_temp.must_fail(
  $$update public.messages set body = 'Edited'$$, 'messages cannot be edited');
select pg_temp.must_fail(
  $$delete from public.messages$$, 'messages cannot be deleted');

select pg_temp.must_fail(
  $$insert into public.messages (match_id, body) select id, '' from public.matches$$,
  'a message needs text or a photo');

select pg_temp.sign_in('ben');
do $$
begin
  assert (select body from public.messages) = 'Hello Ben', 'the other participant reads the message';
end $$;
-- A photo message: the file goes in the match's folder, the text may be empty.
insert into storage.objects (bucket_id, name)
select 'chat-photos', id || '/balcony.jpg' from public.matches;
insert into public.messages (match_id, body, photo_path)
select id, '', id || '/balcony.jpg' from public.matches;
insert into public.conversation_reads (match_id) select id from public.matches;

reset role;
select set_config('test.match_id', (
  select id::text from public.matches
  where user_a = '11111111-1111-4111-8111-111111111111'
    and user_b = '22222222-2222-4222-8222-222222222222'
), true);
set local role authenticated;
select pg_temp.sign_in('cem');
do $$
begin
  assert (select count(*) from public.messages) = 0, 'outsiders cannot read a conversation';
  assert (select count(*) from storage.objects where bucket_id = 'chat-photos') = 0,
    'outsiders cannot see photos shared in a conversation';
  assert (select count(*) from public.conversation_reads) = 0, 'read markers are private';
end $$;
select pg_temp.must_fail(
  format($$insert into public.messages (match_id, body) values (%L, 'Let me in')$$,
         current_setting('test.match_id')),
  'outsiders cannot write into a conversation');
select pg_temp.must_fail(
  format($$insert into storage.objects (bucket_id, name) values ('chat-photos', %L)$$,
         current_setting('test.match_id') || '/intruder.jpg'),
  'outsiders cannot add photos to a conversation');

-- Undoing a like keeps a match that already has messages.
select pg_temp.sign_in('ada');
delete from public.swipes where target_id = '22222222-2222-4222-8222-222222222222';
do $$
begin
  assert (select count(*) from public.matches) = 1, 'undo keeps a match that already has messages';
end $$;
insert into public.swipes (target_id, action) values ('22222222-2222-4222-8222-222222222222', 'like');

-- ---------------------------------------------------------------------------
-- Reports and blocks
-- ---------------------------------------------------------------------------
insert into public.reports (reported_id, reason) values ('22222222-2222-4222-8222-222222222222', 'other');
select pg_temp.must_fail(
  $$insert into public.reports (reported_id, reason, status)
    values ('22222222-2222-4222-8222-222222222222', 'other', 'dismissed')$$,
  'members cannot set a report''s status');
select pg_temp.must_fail(
  $$insert into public.reports (reported_id, reason) values ('22222222-2222-4222-8222-222222222222', 'made-up')$$,
  'report reasons come from a fixed list');

select pg_temp.sign_in('ben');
do $$
begin
  assert (select count(*) from public.reports) = 0, 'a reported member cannot see the report';
end $$;

-- Date of birth: private, and the only way to an age.
select pg_temp.must_fail(
  $$update public.profiles set age = 40 where id = '22222222-2222-4222-8222-222222222222'$$,
  'members cannot type in an age');
select pg_temp.must_fail(
  $$select public.set_birth_date((current_date - interval '17 years')::date)$$,
  'a date of birth under 18 is refused');
select pg_temp.must_fail('select 1 from private.birth_dates', 'members cannot read dates of birth');
select public.set_birth_date((current_date - interval '25 years 3 months')::date);
do $$
begin
  assert (select age from public.profiles where id = '22222222-2222-4222-8222-222222222222') = 25,
    'the age follows from the date of birth';
  assert public.my_birth_date() = (current_date - interval '25 years 3 months')::date,
    'a member can read their own date of birth';
end $$;
select pg_temp.sign_in('ada');
do $$
begin
  assert public.my_birth_date() is null, 'a member cannot read someone else''s date of birth';
end $$;
select pg_temp.sign_in('ben');

-- Moderation: only listed moderators see the queue or close a report.
do $$
begin
  assert not public.is_moderator(), 'members are not moderators by default';
  assert (select count(*) from public.moderation_queue()) = 0,
    'the review queue is empty for members';
end $$;
select pg_temp.must_fail(
  $$select public.review_report((select id from public.reports limit 1), 'reviewed')$$,
  'members cannot close reports');
select pg_temp.must_fail('select 1 from private.moderators', 'members cannot read the moderator list');
select pg_temp.must_fail(
  $$insert into private.moderators (user_id) values ('22222222-2222-4222-8222-222222222222')$$,
  'members cannot make themselves moderators');

reset role;
insert into private.moderators (user_id) values ('33333333-3333-4333-8333-333333333333');
set local role authenticated;
select pg_temp.sign_in('cem');
do $$
declare
  queued record;
begin
  assert public.is_moderator(), 'a listed moderator is recognised';
  select * into queued from public.moderation_queue();
  assert queued.reported_name = 'Ben' and queued.status = 'open' and queued.reports_against = 1,
    'a moderator sees who was reported and how often';
  perform public.review_report(queued.id, 'reviewed', true);
  assert (select status from public.moderation_queue()) = 'reviewed', 'a moderator can close a report';
  assert (select suspended from public.moderation_queue()), 'closing a report can suspend the member';
end $$;
select pg_temp.must_fail(
  $$select public.review_report((select id from public.moderation_queue() limit 1), 'approved')$$,
  'report outcomes come from a fixed list');
select pg_temp.sign_in('ada');
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ben') = 0,
    'a suspended member is hidden, even from a match';
  assert (select count(*) from public.rooms where title = 'Ben''s spare room') = 0,
    'a suspended member''s room is hidden';
  assert (select count(*) from storage.objects where name like '22222222%') = 0,
    'a suspended member''s profile photos are hidden';
end $$;
select pg_temp.sign_in('ben');
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ben') = 1,
    'a suspended member still sees their own profile';
  assert (select count(*) from public.profiles where name = 'Ada') = 0,
    'a suspended member cannot browse other profiles';
end $$;
select pg_temp.must_fail(
  $$insert into public.messages (match_id, body) values (current_setting('test.match_id')::uuid, 'Still here')$$,
  'a suspended member cannot send messages');
reset role;
delete from private.suspended_members where true;
set local role authenticated;

select pg_temp.sign_in('ada');
insert into public.blocks (blocked_id) values ('22222222-2222-4222-8222-222222222222');
do $$
begin
  assert (select count(*) from public.matches) = 0, 'blocking ends the match';
  assert (select count(*) from public.messages) = 0, 'blocking removes the conversation';
  assert (select count(*) from public.profiles where name = 'Ben') = 0, 'a blocked profile is hidden';
  assert (select count(*) from public.rooms where title = 'Ben''s spare room') = 0,
    'a blocked member''s room is hidden';
  assert (select count(*) from storage.objects where name like '22222222%') = 0,
    'a blocked member''s photos are hidden';
  assert (select blocked_name from public.my_blocks()) = 'Ben',
    'a blocker still sees the blocked member''s name in their block list to unblock them';
end $$;

select pg_temp.sign_in('ben');
do $$
begin
  assert (select count(*) from public.profiles where name = 'Ada') = 0,
    'the blocked member no longer sees the blocker';
  assert (select count(*) from public.blocks) = 0, 'the blocked member cannot see the block';
end $$;
select pg_temp.must_fail(
  $$insert into public.swipes (target_id, action) values ('11111111-1111-4111-8111-111111111111', 'like')$$,
  'a blocked member cannot like the blocker again');

-- Chat photos: only the sender can remove one. Leaving deletes everything.
reset role;
insert into public.swipes (swiper_id, target_id, action) values
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'like'),
  ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', 'like')
  on conflict (swiper_id, target_id) do update set action = 'like';
set local role authenticated;
select pg_temp.sign_in('ben');
insert into storage.objects (bucket_id, name)
  select 'chat-photos', id || '/from-ben.jpg' from public.matches;
select pg_temp.sign_in('cem');
delete from storage.objects where name like '%/from-ben.jpg';
do $$
begin
  assert (select count(*) from storage.objects where name like '%/from-ben.jpg') = 1,
    'a member cannot remove a chat photo someone else sent';
end $$;
do $$
begin
  perform public.delete_account('22222222-2222-4222-8222-222222222222');
  raise exception 'RULE BROKEN: delete_account accepted mismatched user';
exception when insufficient_privilege then
  null;
end $$;
select public.delete_account('33333333-3333-4333-8333-333333333333');
reset role;
do $$
begin
  assert (select count(*) from auth.users where id = '33333333-3333-4333-8333-333333333333') = 0,
    'deleting an account removes the sign-in';
  assert (select count(*) from public.profiles where id = '33333333-3333-4333-8333-333333333333') = 0,
    'deleting an account removes the profile';
  assert (select count(*) from public.matches
          where '33333333-3333-4333-8333-333333333333' in (user_a, user_b)) = 0,
    'deleting an account removes its matches';
  assert (select count(*) from auth.users where id = '22222222-2222-4222-8222-222222222222') = 1,
    'deleting an account leaves other members alone';
end $$;
set local role anon;
select pg_temp.must_fail($$select public.delete_account()$$,
  'visitors cannot call account deletion');

reset role;
rollback;

select 'All RoomPair policy tests passed.' as result;
