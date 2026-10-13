-- T-044: records and strength graphs read a person's workouts by date range
-- and an exercise's history. Every workout query, and row-level security on
-- set_logs, look sessions up by person and date and sets by session.

create index if not exists workout_sessions_user_day on public.workout_sessions (user_id, performed_on desc);
create index if not exists set_logs_session on public.set_logs (session_id);
create index if not exists set_logs_exercise on public.set_logs (exercise_id, session_id);
