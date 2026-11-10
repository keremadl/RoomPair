-- Demo accounts keep the prototype lively: selected demo profiles like every
-- newcomer who finishes onboarding, so a first mutual match is one swipe away.
-- This is presentation behaviour, isolated here so it can be dropped as a unit.

alter table public.profiles
  add column demo_likes_newcomers boolean not null default false;
comment on column public.profiles.demo_likes_newcomers is
  'Demo accounts only: automatically like members when they finish onboarding.';

create function private.demo_likes_newcomer()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.onboarded and not old.onboarded and not new.is_demo then
    insert into public.swipes (swiper_id, target_id, action)
    select p.id, new.id, 'like'
    from public.profiles p
    where p.is_demo and p.demo_likes_newcomers
    on conflict (swiper_id, target_id) do nothing;
  end if;
  return null;
end;
$$;

revoke all on function private.demo_likes_newcomer() from public, anon, authenticated;

create trigger profiles_demo_likes after update of onboarded on public.profiles
  for each row execute function private.demo_likes_newcomer();
