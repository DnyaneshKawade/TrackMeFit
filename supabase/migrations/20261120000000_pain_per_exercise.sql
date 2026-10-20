-- "Something hurt" per exercise (spec T-108): the exercises that hurt, so the
-- week review can suggest a swap for that lift only. `pain` stays true when
-- any did, so older answers keep working.

alter table public.muscle_feedback
  add column hurt_exercises text[] not null default '{}'
    constraint muscle_feedback_hurt_exercises check (cardinality(hurt_exercises) <= 20);
