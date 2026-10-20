-- Exercise settings (spec T-112): the person's own weight step, rest time and
-- machine or seat notes for any exercise. Same row rules as favourites.

create table public.exercise_settings (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Built-in library id or "custom:<uuid>"
  exercise_id text not null check (length(exercise_id) between 1 and 100),
  step_kg numeric check (step_kg is null or step_kg between 0.25 and 20),
  rest_seconds int check (rest_seconds is null or rest_seconds between 15 and 600),
  note text check (note is null or length(note) between 1 and 200),
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id),
  check (step_kg is not null or rest_seconds is not null or note is not null)
);
alter table public.exercise_settings enable row level security;
create policy "read" on public.exercise_settings for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.exercise_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.exercise_settings to authenticated;

-- Download my data now includes exercise settings.
create or replace function public.export_my_data() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  result jsonb;
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  select jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('email', u.email, 'phone', u.phone, 'joined_at', u.created_at) from auth.users u where u.id = me),
    'profiles', (select to_jsonb(x) from profiles x where x.id = me),
    'health_answers', (select to_jsonb(x) from health_answers x where x.user_id = me),
    'user_roles', (select to_jsonb(x) from user_roles x where x.user_id = me),
    'food_logs', (select coalesce(jsonb_agg(to_jsonb(x) order by x.logged_on, x.created_at), '[]') from food_logs x where x.user_id = me),
    'custom_foods', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from custom_foods x where x.owner_id = me),
    'meal_plans', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from meal_plans x where x.user_id = me),
    'diet_targets', (select coalesce(jsonb_agg(to_jsonb(x) order by x.starts_on), '[]') from diet_targets x where x.user_id = me),
    'weigh_ins', (select coalesce(jsonb_agg(to_jsonb(x) order by x.measured_on), '[]') from weigh_ins x where x.user_id = me),
    'measurements', (select coalesce(jsonb_agg(to_jsonb(x) order by x.measured_on), '[]') from measurements x where x.user_id = me),
    'progress_photos', (select coalesce(jsonb_agg(to_jsonb(x) order by x.taken_on), '[]') from progress_photos x where x.user_id = me),
    'workout_plans', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from workout_plans x where x.user_id = me),
    'plan_days', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from plan_days x join workout_plans p on p.id = x.plan_id where p.user_id = me),
    'plan_exercises', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from plan_exercises x join plan_days d on d.id = x.day_id
      join workout_plans p on p.id = d.plan_id where p.user_id = me),
    'workout_sessions', (select coalesce(jsonb_agg(to_jsonb(x) order by x.performed_on), '[]') from workout_sessions x where x.user_id = me),
    'set_logs', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from set_logs x join workout_sessions s on s.id = x.session_id where s.user_id = me),
    'muscle_feedback', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from muscle_feedback x join workout_sessions s on s.id = x.session_id where s.user_id = me),
    'custom_exercises', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from custom_exercises x where x.owner_id = me),
    'favourite_exercises', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from favourite_exercises x where x.user_id = me),
    'exercise_settings', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from exercise_settings x where x.user_id = me),
    'check_ins', (select coalesce(jsonb_agg(to_jsonb(x) order by x.week_start), '[]') from check_ins x where x.user_id = me),
    'coach_clients', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_clients x where me in (x.coach_id, x.client_id)),
    'chat_messages', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from chat_messages x
      join coach_clients c on c.id = x.link_id where me in (c.coach_id, c.client_id)),
    'coach_invites', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_invites x where x.coach_id = me),
    'coach_details', (select to_jsonb(x) from coach_details x where x.coach_id = me),
    'coach_certificates', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_certificates x where x.coach_id = me),
    'data_requests', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from data_requests x where x.person_id = me)
  ) into result;
  return result;
end
$$;
