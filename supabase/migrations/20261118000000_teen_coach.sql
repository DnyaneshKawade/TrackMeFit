-- T-122: people under 18 can have a coach. DK, 20 Oct 2026: keep only the
-- parent's yes, since no law or store rule asks for more. Until a parent
-- says yes, a teen still can't add data, so a coach sees nothing new.
drop trigger if exists coach_clients_no_minors on public.coach_clients;
drop function if exists public.no_coach_for_minors();
