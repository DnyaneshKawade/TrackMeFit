-- Onboarding extras: target weight, a rough picture of the current diet,
-- food allergies and any other health notes in the person's own words.

alter table public.profiles
  add column target_weight_kg numeric check (target_weight_kg between 20 and 350),
  -- {"counts": {"tmf:dish:roti": 4, ...}, "kcal": 1850, "proteinG": 62}
  add column current_diet jsonb,
  add column allergies text[] not null default '{}',
  add column other_health text not null default '' check (char_length(other_health) <= 500);
