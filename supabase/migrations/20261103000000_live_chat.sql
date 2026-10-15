-- Live chat (T-026h): new messages and "Seen" reach an open chat at once
-- through Supabase Realtime. Realtime checks the same row-level security, so
-- only the two sides of an active link receive a chat's changes.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end
$$;
