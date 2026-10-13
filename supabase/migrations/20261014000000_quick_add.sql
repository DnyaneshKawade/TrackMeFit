-- Quick add: a food log entry with calories (and optional macros) typed in,
-- without a food or a weight. Such rows have food_id 'quick' and no grams.
alter table public.food_logs alter column grams drop not null;
alter table public.food_logs drop constraint food_logs_grams_check;
alter table public.food_logs add constraint food_logs_grams_check
  check (grams is null or (grams > 0 and grams <= 5000));
alter table public.food_logs add constraint food_logs_quick_add_check
  check (grams is not null or food_id = 'quick');
