-- Coaches can sign up with Google (T-066). Google sign-up can't carry a role,
-- so a new Google account picks "For myself" or "I'm a coach" once, on the
-- first screen. Email sign-ups pick on the form, as before.

alter table public.profiles add column role_chosen boolean not null default true;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, role_chosen)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'coach' then 'coach' else 'user' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    -- Only a sign-up through Google (or another provider) without a role still has to pick.
    new.raw_user_meta_data ? 'role' or coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email'
  );
  return new;
end
$$;

-- Nobody switches their own role or the "picked" flag directly; only
-- choose_role below may, once.
create or replace function public.keep_role() returns trigger
language plpgsql as $$
begin
  if (new.role <> old.role or new.role_chosen <> old.role_chosen) and current_user in ('authenticated', 'anon') then
    raise exception 'role cannot be changed';
  end if;
  return new;
end
$$;

create function public.choose_role(picked text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or picked not in ('user', 'coach') then
    raise exception 'role not valid';
  end if;
  update public.profiles set role = picked, role_chosen = true
    where id = auth.uid() and not role_chosen;
  if not found then
    raise exception 'role already chosen';
  end if;
  return picked;
end
$$;

revoke execute on function public.choose_role(text) from public, anon;
grant execute on function public.choose_role(text) to authenticated;
