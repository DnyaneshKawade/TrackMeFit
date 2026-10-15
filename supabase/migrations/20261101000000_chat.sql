-- Chat between a person and their coach (T-026f). Messages belong to one
-- coach link, so a new coach never sees chat with an earlier one. Once a link
-- ends, neither side can read or send in it.

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.coach_clients (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  -- When the other side opened the chat after this message.
  read_at timestamptz
);

-- Pages of a chat, newest first, and unread counts.
create index chat_messages_link_time on public.chat_messages (link_id, created_at desc);
create index chat_messages_unread on public.chat_messages (link_id) where read_at is null;

-- True when the signed-in person is either side of an active link.
create function public.in_link(link uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.coach_clients
    where id = link and status = 'active' and auth.uid() in (coach_id, client_id)
  )
$$;

alter table public.chat_messages enable row level security;

create policy "read in link" on public.chat_messages for select to authenticated using (public.in_link(link_id));
create policy "send in link" on public.chat_messages for insert to authenticated
  with check (sender_id = auth.uid() and public.in_link(link_id));

-- Supabase grants every new table to everyone by default, so start from none.
-- Messages can't be changed or deleted; read_at is set by mark_chat_read.
revoke all on public.chat_messages from anon, authenticated;
grant select on public.chat_messages to authenticated;
grant insert (link_id, body) on public.chat_messages to authenticated;

-- Marks the other side's messages in a chat as read.
create function public.mark_chat_read(link uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.in_link(link) then
    raise exception 'not your chat';
  end if;
  update public.chat_messages set read_at = now()
    where link_id = link and sender_id <> auth.uid() and read_at is null;
end
$$;

revoke execute on function public.mark_chat_read(uuid) from public, anon;
grant execute on function public.mark_chat_read(uuid) to authenticated;
revoke execute on function public.in_link(uuid) from public, anon;
grant execute on function public.in_link(uuid) to authenticated;
