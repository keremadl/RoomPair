-- Leaving for good, cleaning up shared photos, and live updates.

-- A member can delete their own account. Everything they own goes with it:
-- profile, room, likes, matches, messages, blocks and reports all cascade
-- from the account row. The app removes their photo files first.
create function public.delete_account()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;
revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- A photo sent in a chat can be removed by the member who sent it (used when
-- they delete their account). Nobody can remove the other person's photo.
create policy "Members remove chat photos they sent" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'chat-photos'
    and owner_id = (select auth.uid())::text
  );

-- Live updates: new matches and messages are pushed to the members who may
-- read them (row level security applies to the feed as well). Likes are left
-- out on purpose: a removed row is announced to every listener by its key,
-- and for a like that key says who liked whom.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime
      add table public.messages, public.matches;
  end if;
end $$;
