-- Private buckets for photos. Files are never public: the app asks for
-- short-lived signed links, and these policies decide who may ask.
--
--   profile-photos/<member id>/<file>   the member's own photos and room photos
--   chat-photos/<match id>/<file>       photos shared inside one conversation

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos', 'profile-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('chat-photos', 'chat-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- The first folder of a path: a member id for profile photos, a match id for chat photos.
create function private.folder_id(object_name text)
returns uuid
language sql immutable set search_path = ''
as $$
  select case
    when split_part(object_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 1)::uuid
  end;
$$;
grant execute on function private.folder_id(text) to authenticated;

-- Profile photos: readable by members who can see that profile, i.e. not
-- across a block; writable only inside your own folder.
create policy "Members read profile photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (
      private.folder_id(name) = (select auth.uid())
      or not private.blocked_between(private.folder_id(name))
    )
  );

create policy "Members add their own profile photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and private.folder_id(name) = (select auth.uid())
  );

create policy "Members remove their own profile photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and private.folder_id(name) = (select auth.uid())
  );

-- Chat photos: only the two people in the match, in the match's folder.
create policy "Participants read chat photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-photos'
    and private.is_match_participant(private.folder_id(name))
  );

create policy "Participants add chat photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-photos'
    and private.is_match_participant(private.folder_id(name))
  );
