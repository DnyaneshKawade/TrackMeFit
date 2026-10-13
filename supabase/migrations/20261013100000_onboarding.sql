-- Onboarding extras: goal pace and target weight, food habits, a rough picture
-- of the current diet, training setup, other health notes, and when the person
-- finished (or skipped) onboarding.

alter table public.profiles
  add column target_weight_kg numeric check (target_weight_kg between 20 and 350),
  -- Fraction of body weight per week, e.g. -0.005 to lose 0.5 % a week.
  add column goal_rate numeric check (goal_rate between -0.01 and 0.01),
  -- {"counts": {"tmf:dish:roti": 4, ...}, "kcal": 1850, "proteinG": 62}
  add column current_diet jsonb,
  add column allergies text[] not null default '{}',
  -- e.g. {no_onion_garlic}
  add column food_rules text[] not null default '{}',
  -- e.g. {weekly, ekadashi, navratri, ramadan}
  add column fasting text[] not null default '{}',
  add column equipment text check (equipment in ('gym', 'home', 'none')),
  add column other_health text not null default '' check (char_length(other_health) <= 500),
  add column onboarded_at timestamptz;
