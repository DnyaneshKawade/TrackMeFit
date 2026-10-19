-- T-088: an ended coach link stays ended. Before, the client's update policy
-- had no status check, so a client could set an ended link back to active
-- without a new code, past the coach's or admin's "End" and the client
-- limit. Joining again with a code still works: join_coach runs as the
-- function owner, not as the signed-in person.
create function public.keep_link_ended() returns trigger
language plpgsql as $$
begin
  if old.status = 'ended' and new.status <> 'ended' and current_user = 'authenticated' then
    raise exception 'an ended coach link can only start again with a new code';
  end if;
  return new;
end
$$;

create trigger coach_clients_keep_ended before update on public.coach_clients
  for each row execute function public.keep_link_ended();
