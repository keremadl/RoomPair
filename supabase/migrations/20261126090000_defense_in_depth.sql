-- Defense-in-depth hardening following the independent Supabase audit:
--   1. Hide moderator audit columns (reviewed_by, reviewed_at) from authenticated
--      SELECT on public.reports, and block suspended members from opening reports.
--   2. Enforce match-folder integrity on public.messages.photo_path.
--   3. Add covering FK indexes for reports.reviewed_by and
--      private.suspended_members.suspended_by.

-- ---------------------------------------------------------------------------
-- 1. Reports column-level SELECT & active-member INSERT guard
-- ---------------------------------------------------------------------------

revoke select on public.reports from authenticated;
grant select (
  id, reporter_id, reported_id, reason, details, status, created_at
) on public.reports to authenticated;

drop policy if exists "Members report as themselves" on public.reports;
create policy "Members report as themselves" on public.reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and private.caller_is_active_member()
  );

-- ---------------------------------------------------------------------------
-- 2. Message photo_path folder integrity
-- ---------------------------------------------------------------------------

alter table public.messages
  drop constraint if exists messages_photo_path_folder_check;
alter table public.messages
  add constraint messages_photo_path_folder_check
  check (
    photo_path is null
    or (
      split_part(photo_path, '/', 1) = match_id::text
      and nullif(split_part(photo_path, '/', 2), '') is not null
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Covering FK indexes for moderator audit references
-- ---------------------------------------------------------------------------

create index if not exists reports_reviewed_by_idx
  on public.reports (reviewed_by)
  where reviewed_by is not null;

create index if not exists suspended_members_suspended_by_idx
  on private.suspended_members (suspended_by)
  where suspended_by is not null;
