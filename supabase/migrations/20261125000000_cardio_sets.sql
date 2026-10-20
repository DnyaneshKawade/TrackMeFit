-- Cardio sets (spec T-114): a time, and a distance for moves that cover
-- ground. A cardio set has no weight or reps, and a distance needs a time.
-- Row-level security is unchanged; set_logs is already in "Download my data".

alter table public.set_logs
  add column duration_sec int
    constraint set_logs_duration check (duration_sec between 1 and 21600),
  add column distance_km numeric(5, 2)
    constraint set_logs_distance check (distance_km > 0 and distance_km <= 100),
  add constraint set_logs_cardio check (
    (distance_km is null or duration_sec is not null)
    and (duration_sec is null or (weight_kg = 0 and reps = 0 and tag is null and mini_reps is null))
  );
