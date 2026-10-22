-- Soreness timing and pump (spec T-082g). "How did it heal?" is now asked
-- at the muscle's first set in the next workout, as in RP, and saved on that
-- workout's row. Effort, pain and an optional pump are saved after the
-- workout. So a row may hold only one of the two.

alter table public.muscle_feedback
  alter column recovery drop not null,
  alter column effort drop not null;

-- New answers: never sore, healed a while ago, healed just in time, still
-- sore. Old answers stay as they were; the app reads fresh as healed early,
-- a bit sore as just in time, and very sore as still sore.
alter table public.muscle_feedback drop constraint muscle_feedback_recovery_check;
alter table public.muscle_feedback add constraint muscle_feedback_recovery_check
  check (recovery in ('fresh', 'bitSore', 'verySore', 'never', 'healedEarly', 'onTime', 'stillSore'));

alter table public.muscle_feedback
  add column pump text constraint muscle_feedback_pump_check check (pump in ('low', 'some', 'great')),
  add constraint muscle_feedback_answered check (recovery is not null or effort is not null);
