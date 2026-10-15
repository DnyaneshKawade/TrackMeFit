-- One row per active client for the coach's list (spec T-026b): last food,
-- last week's averages, the current target and workouts. Runs with the
-- coach's own rights, so the privacy rules still decide what is counted.
create index if not exists diet_targets_user_start on public.diet_targets (user_id, starts_on desc);

create function public.client_summaries(today date) returns table (
  link_id uuid,
  client_id uuid,
  full_name text,
  goal text,
  training_days int,
  last_food_on date,
  food_days int,
  avg_kcal numeric,
  avg_protein_g numeric,
  target_kcal int,
  target_protein_g int,
  workouts int,
  last_workout_on date
)
language sql stable security invoker set search_path = public as $$
  select
    c.id, c.client_id, p.full_name, p.goal, p.training_days,
    (select max(f.logged_on) from food_logs f where f.user_id = c.client_id),
    coalesce(d.days, 0), d.kcal, d.protein,
    t.kcal, t.protein_g,
    (select count(*)::int from workout_sessions s where s.user_id = c.client_id and s.performed_on between today - 6 and today),
    (select max(s.performed_on) from workout_sessions s where s.user_id = c.client_id)
  from coach_clients c
  join profiles p on p.id = c.client_id
  left join lateral (
    select count(*)::int as days, avg(day_kcal) as kcal, avg(day_protein) as protein
    from (
      select sum(f.kcal) as day_kcal, sum(f.protein_g) as day_protein
      from food_logs f
      where f.user_id = c.client_id and f.logged_on between today - 7 and today - 1
      group by f.logged_on
    ) per_day
  ) d on true
  left join lateral (
    select dt.kcal, dt.protein_g from diet_targets dt
    where dt.user_id = c.client_id and dt.starts_on <= today
    order by dt.starts_on desc, dt.created_at desc limit 1
  ) t on true
  where c.coach_id = auth.uid() and c.status = 'active'
$$;

grant execute on function public.client_summaries(date) to authenticated;
