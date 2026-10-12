-- Track Me Fit: first database schema.
-- Every table has row-level security. A person sees and changes only their own
-- rows. A coach with an *active* link to a client can read the client's data and
-- set the client's diet targets and workout plans; coaches never edit a
-- client's own logs. Public food data (dishes, USDA, Open Food Facts) ships with
-- the app and is not stored here; only foods people add themselves are.

-- People ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'coach')),
  full_name text not null default '',
  sex text check (sex in ('male', 'female')),
  birth_date date,
  height_cm numeric check (height_cm between 90 and 250),
  activity text check (activity in ('desk', 'on_feet', 'physical')),
  training_days int check (training_days between 0 and 7),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  goal text check (goal in ('lose', 'maintain', 'gain', 'recomp')),
  diet_pref text check (diet_pref in ('veg', 'eggetarian', 'nonveg', 'vegan', 'jain')),
  -- Health history from onboarding, e.g. {"diabetes": true, "kidney": false}
  medical jsonb not null default '{}'::jsonb,
  plan_mode text not null default 'self' check (plan_mode in ('self', 'app', 'coach')),
  created_at timestamptz not null default now()
);

create table public.coach_clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'active', 'ended')),
  created_at timestamptz not null default now(),
  unique (coach_id, client_id),
  check (coach_id <> client_id)
);

-- True when the signed-in person is an active coach of `client`.
create function public.is_coach_of(client uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = auth.uid() and client_id = client and status = 'active'
  )
$$;

-- True when the signed-in person is `person` or their active coach.
create function public.can_see(person uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select person = auth.uid() or public.is_coach_of(person)
$$;

create function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coach')
$$;

-- A profile is created for every new sign-up. The sign-up form passes
-- {"role": "coach"} in user metadata for coach accounts.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'role' = 'coach' then 'coach' else 'user' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nobody can switch their own role after sign-up.
create function public.keep_role() returns trigger
language plpgsql as $$
begin
  if new.role <> old.role then
    raise exception 'role cannot be changed';
  end if;
  return new;
end
$$;

create trigger profiles_keep_role before update on public.profiles
  for each row execute function public.keep_role();

-- A coach link always joins the same two people; only its status changes.
create function public.keep_link_parties() returns trigger
language plpgsql as $$
begin
  if new.coach_id <> old.coach_id or new.client_id <> old.client_id then
    raise exception 'coach and client of a link cannot be changed';
  end if;
  return new;
end
$$;

create trigger coach_clients_keep_parties before update on public.coach_clients
  for each row execute function public.keep_link_parties();

-- Food -----------------------------------------------------------------------

-- Foods, products and recipes people add themselves (private to them).
create table public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  brand text,
  state text not null check (state in ('raw', 'cooked', 'asSold')),
  kcal numeric not null check (kcal between 0 and 950),
  protein_g numeric not null check (protein_g between 0 and 100),
  carb_g numeric not null check (carb_g between 0 and 100),
  fat_g numeric not null check (fat_g between 0 and 100),
  portions jsonb not null default '[]'::jsonb,
  barcode text,
  -- For recipes: [{"foodId": "...", "grams": 100}, ...] and the cooked weight
  recipe jsonb,
  created_at timestamptz not null default now()
);

create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  logged_on date not null default current_date,
  meal text not null check (meal in ('breakfast', 'lunch', 'snacks', 'dinner')),
  -- e.g. "tmf:dish:dal-tadka", "usda:169756", "off:8901...", "custom:<uuid>"
  food_id text not null,
  -- Snapshot at logging time, so later data fixes don't rewrite history
  food_name text not null,
  grams numeric not null check (grams > 0 and grams <= 5000),
  kcal numeric not null check (kcal >= 0),
  protein_g numeric not null check (protein_g >= 0),
  carb_g numeric not null check (carb_g >= 0),
  fat_g numeric not null check (fat_g >= 0),
  created_at timestamptz not null default now()
);
create index food_logs_user_day on public.food_logs (user_id, logged_on);

-- Calorie and macro targets, set by the person or their coach. Newest
-- starts_on wins. 'suggested' rows came from the engine and were accepted.
create table public.diet_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  starts_on date not null default current_date,
  kcal int not null check (kcal between 800 and 6000),
  protein_g int not null check (protein_g between 0 and 400),
  carb_g int not null check (carb_g between 0 and 800),
  fat_g int not null check (fat_g between 0 and 300),
  source text not null default 'manual' check (source in ('manual', 'suggested')),
  set_by uuid not null default auth.uid() references public.profiles (id),
  note text,
  created_at timestamptz not null default now()
);

-- Progress -------------------------------------------------------------------

create table public.weigh_ins (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric not null check (weight_kg between 20 and 350),
  primary key (user_id, measured_on)
);

create table public.measurements (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  measured_on date not null default current_date,
  waist_cm numeric check (waist_cm between 30 and 250),
  hip_cm numeric check (hip_cm between 30 and 250),
  chest_cm numeric check (chest_cm between 30 and 250),
  arm_cm numeric check (arm_cm between 10 and 80),
  thigh_cm numeric check (thigh_cm between 20 and 120),
  primary key (user_id, measured_on)
);

-- Training -------------------------------------------------------------------

-- Exercises people add themselves; the built-in library ships with the app.
create table public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}'
);

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  hard_weeks int not null default 4 check (hard_weeks between 1 and 8),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans (id) on delete cascade,
  day_index int not null check (day_index between 0 and 13),
  name text not null,
  unique (plan_id, day_index)
);

create table public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.plan_days (id) on delete cascade,
  position int not null,
  -- Built-in library id or "custom:<uuid>"
  exercise_id text not null,
  sets int not null check (sets between 1 and 10),
  rep_min int not null check (rep_min between 1 and 50),
  rep_max int not null check (rep_max between 1 and 50 and rep_max >= rep_min)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  plan_day_id uuid references public.plan_days (id) on delete set null,
  performed_on date not null default current_date,
  notes text
);

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id text not null,
  set_index int not null,
  weight_kg numeric not null check (weight_kg between 0 and 600),
  reps int not null check (reps between 0 and 100),
  rir int check (rir between 0 and 10),
  is_warmup boolean not null default false
);

-- Row-level security ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.coach_clients enable row level security;
alter table public.custom_foods enable row level security;
alter table public.food_logs enable row level security;
alter table public.diet_targets enable row level security;
alter table public.weigh_ins enable row level security;
alter table public.measurements enable row level security;
alter table public.custom_exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.set_logs enable row level security;

-- Profiles: your own; your clients'; your active coach's.
create policy "see own, client or coach profile" on public.profiles for select to authenticated
  using (
    public.can_see(id)
    or exists (select 1 from public.coach_clients c
               where c.client_id = auth.uid() and c.coach_id = profiles.id and c.status <> 'ended')
  );
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Coach links: a coach invites; the client accepts or ends; either side sees it.
create policy "both sides see link" on public.coach_clients for select to authenticated
  using (coach_id = auth.uid() or client_id = auth.uid());
create policy "coach invites" on public.coach_clients for insert to authenticated
  with check (coach_id = auth.uid() and status = 'invited' and public.is_coach());
create policy "client accepts or ends" on public.coach_clients for update to authenticated
  using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "coach ends" on public.coach_clients for update to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and status = 'ended');

-- Owner-only writes; owner and active coach read.
create policy "read" on public.custom_foods for select to authenticated using (public.can_see(owner_id));
create policy "write own" on public.custom_foods for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "read" on public.food_logs for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.food_logs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read" on public.weigh_ins for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.weigh_ins for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read" on public.measurements for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.measurements for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read" on public.custom_exercises for select to authenticated using (public.can_see(owner_id));
create policy "write own" on public.custom_exercises for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "read" on public.workout_sessions for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.workout_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read" on public.set_logs for select to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and public.can_see(s.user_id)));
create policy "write own" on public.set_logs for all to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- Targets and plans: the person or their active coach may set them.
create policy "read" on public.diet_targets for select to authenticated using (public.can_see(user_id));
create policy "person or coach sets" on public.diet_targets for all to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id) and set_by = auth.uid());

create policy "person or coach plans" on public.workout_plans for all to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id));
create policy "person or coach plans" on public.plan_days for all to authenticated
  using (exists (select 1 from public.workout_plans p where p.id = plan_id and public.can_see(p.user_id)))
  with check (exists (select 1 from public.workout_plans p where p.id = plan_id and public.can_see(p.user_id)));
create policy "person or coach plans" on public.plan_exercises for all to authenticated
  using (exists (select 1 from public.plan_days d join public.workout_plans p on p.id = d.plan_id
                 where d.id = day_id and public.can_see(p.user_id)))
  with check (exists (select 1 from public.plan_days d join public.workout_plans p on p.id = d.plan_id
                      where d.id = day_id and public.can_see(p.user_id)));

-- Supabase grants these by default; stated here so the schema is self-contained.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
