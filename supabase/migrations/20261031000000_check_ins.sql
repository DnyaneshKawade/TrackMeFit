-- Weekly check-ins (T-026e): a person with a coach answers five short
-- questions once a week; their coach reads it and replies.

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- The Monday of the week it is for.
  week_start date not null check (extract(isodow from week_start) = 1),
  energy smallint not null check (energy between 1 and 5),
  sleep smallint not null check (sleep between 1 and 5),
  mood smallint not null check (mood between 1 and 5),
  diet smallint not null check (diet between 1 and 5),
  training smallint not null check (training between 1 and 5),
  note text not null default '' check (length(note) <= 500),
  ask text not null default '' check (length(ask) <= 500),
  coach_reply text check (length(coach_reply) between 1 and 1000),
  replied_by uuid references public.profiles (id),
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.check_ins enable row level security;

create policy "read" on public.check_ins for select to authenticated using (public.can_see(user_id));
create policy "add own" on public.check_ins for insert to authenticated with check (user_id = auth.uid());
-- The person can change answers until the coach replies.
create policy "change own until replied" on public.check_ins for update to authenticated
  using (user_id = auth.uid() and replied_at is null) with check (user_id = auth.uid());

-- The person writes only the answers; the reply goes through reply_check_in.
-- Supabase grants every new table to everyone by default, so start from none.
revoke all on public.check_ins from anon, authenticated;
grant select on public.check_ins to authenticated;
grant insert (user_id, week_start, energy, sleep, mood, diet, training, note, ask) on public.check_ins to authenticated;
grant update (energy, sleep, mood, diet, training, note, ask) on public.check_ins to authenticated;

-- Only the person's active coach replies, and the reply records who and when.
create function public.reply_check_in(check_in uuid, reply text) returns void
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
begin
  select user_id into owner from public.check_ins where id = check_in;
  if owner is null or not public.is_coach_of(owner) then
    raise exception 'not your client';
  end if;
  if length(btrim(coalesce(reply, ''))) = 0 then
    raise exception 'reply is empty';
  end if;
  update public.check_ins
    set coach_reply = btrim(reply), replied_by = auth.uid(), replied_at = now()
    where id = check_in;
end
$$;

revoke execute on function public.reply_check_in(uuid, text) from public, anon;
grant execute on function public.reply_check_in(uuid, text) to authenticated;
