-- Myo-reps (spec T-111): a start set, then short mini-sets. `reps` holds the
-- total; `mini_reps` the mini-sets, 1 to 10 of them, each 1 to 30 reps.

alter table public.set_logs drop constraint set_logs_tag_check;
alter table public.set_logs add constraint set_logs_tag_check check (tag in ('warmup', 'drop', 'failure', 'myo'));

alter table public.set_logs
  add column mini_reps smallint[]
    constraint set_logs_mini_reps check (
      mini_reps is null
      or (tag is not distinct from 'myo' and cardinality(mini_reps) between 1 and 10 and 1 <= all (mini_reps) and 30 >= all (mini_reps))
    );
