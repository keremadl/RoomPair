-- Moderation: a short list of moderators who can read every report, close
-- it, and hide a member from everyone else.
--
-- Both lists live in the private schema, which the Data API does not expose:
-- members can neither read them nor add themselves. A moderator is added by
-- hand in the SQL editor:
--   insert into private.moderators (user_id)
--     select id from auth.users where email = 'someone@example.com';

create table private.moderators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
create table private.suspended_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  suspended_by uuid references auth.users (id) on delete set null,
  suspended_at timestamptz not null default now()
);
alter table private.moderators enable row level security;
alter table private.suspended_members enable row level security;

create function private.is_moderator()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from private.moderators m where m.user_id = (select auth.uid())
  );
$$;
create function private.is_suspended(member uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from private.suspended_members s where s.user_id = member
  );
$$;
grant execute on function private.is_moderator() to authenticated;
grant execute on function private.is_suspended(uuid) to authenticated;

-- A suspended member and their listing disappear for everyone but themselves.
-- Restrictive policies narrow whatever the other policies allow.
create policy "Suspended members are hidden" on public.profiles
  as restrictive for select to authenticated
  using (id = (select auth.uid()) or not private.is_suspended(id));
create policy "Suspended members' rooms are hidden" on public.rooms
  as restrictive for select to authenticated
  using (owner_id = (select auth.uid()) or not private.is_suspended(owner_id));

create function public.is_moderator()
returns boolean
language sql stable set search_path = ''
as $$ select private.is_moderator(); $$;

-- The review queue: open reports first, newest first. Empty for everyone
-- who is not a moderator.
create function public.moderation_queue()
returns table (
  id uuid,
  created_at timestamptz,
  reason text,
  status text,
  reporter_name text,
  reported_id uuid,
  reported_name text,
  reports_against bigint,
  suspended boolean
)
language sql stable security definer set search_path = ''
as $$
  select r.id, r.created_at, r.reason, r.status, reporter.name, r.reported_id,
         reported.name,
         (select count(*) from public.reports other
           where other.reported_id = r.reported_id),
         private.is_suspended(r.reported_id)
  from public.reports r
  join public.profiles reporter on reporter.id = r.reporter_id
  join public.profiles reported on reported.id = r.reported_id
  where private.is_moderator()
  order by (r.status = 'open') desc, r.created_at desc
  limit 200;
$$;

-- Closes a report as reviewed or dismissed; optionally hides the reported member.
create function public.review_report(report uuid, outcome text, suspend boolean default false)
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
  update public.reports set status = outcome where id = report
    returning reported_id into member;
  if member is null then
    raise exception 'Report not found.' using errcode = 'P0002';
  end if;
  if suspend then
    insert into private.suspended_members (user_id, suspended_by)
    values (member, (select auth.uid()))
    on conflict (user_id) do nothing;
  end if;
end;
$$;

revoke execute on function public.is_moderator() from public, anon;
revoke execute on function public.moderation_queue() from public, anon;
revoke execute on function public.review_report(uuid, text, boolean) from public, anon;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.moderation_queue() to authenticated;
grant execute on function public.review_report(uuid, text, boolean) to authenticated;
