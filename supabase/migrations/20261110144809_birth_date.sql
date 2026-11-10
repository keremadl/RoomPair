-- Members give their date of birth, not their age. Others only ever see the
-- age: the date itself lives in the private schema, which the Data API does
-- not expose, and is read and written through two functions that act on the
-- caller alone.

create table private.birth_dates (
  user_id uuid primary key references auth.users (id) on delete cascade,
  birth_date date not null
);
alter table private.birth_dates enable row level security;

create function private.age_on(birth date, day date)
returns integer
language sql immutable set search_path = ''
as $$ select extract(year from age(day, birth))::integer; $$;

-- Saves the caller's date of birth and the age that follows from it.
create function public.set_birth_date(birth date)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  years integer := private.age_on(birth, current_date);
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  if birth is null or years < 18 or years > 120 then
    raise exception 'You need to be 18 or older.' using errcode = '23514';
  end if;
  insert into private.birth_dates (user_id, birth_date)
  values ((select auth.uid()), birth)
  on conflict (user_id) do update set birth_date = excluded.birth_date;
  update public.profiles set age = years where id = (select auth.uid());
end;
$$;

-- The caller's own date of birth. Reading it also moves the shown age on
-- after a birthday, so an age never goes stale for an active member.
create function public.my_birth_date()
returns date
language plpgsql security definer set search_path = ''
as $$
declare
  birth date;
begin
  select b.birth_date into birth
  from private.birth_dates b where b.user_id = (select auth.uid());
  if birth is not null then
    update public.profiles
    set age = private.age_on(birth, current_date)
    where id = (select auth.uid())
      and age is distinct from private.age_on(birth, current_date);
  end if;
  return birth;
end;
$$;

revoke execute on function public.set_birth_date(date) from public, anon;
revoke execute on function public.my_birth_date() from public, anon;
grant execute on function public.set_birth_date(date) to authenticated;
grant execute on function public.my_birth_date() to authenticated;
