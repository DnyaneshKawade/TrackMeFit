# T-126: Log a past workout

Status: built
Task: [T-126](../tasks/TASKS.md)

## Problem
People forget to log, or train without their phone. They need to add that workout later, on the right day.

## Acceptance criteria
1. Given the Start a workout sheet, when it opens, then the workout date starts at today and cannot be in the future.
2. Given an earlier date is picked, when a workout is started and a set logged, then the workout and its sets are saved on that date.
3. Given a past workout is open, when sets are logged, then it shows its date and no live workout clock or rest timer.
4. Given a date outside the allowed range, when a workout is started, then it falls back to today.

## Rules and reasons
- A past workout can be up to 365 days back. The screen says "This workout is logged on 9 Oct."
- Live clocks are hidden, since the workout already happened.
- Records, graphs, the calendar and plan "next up" use the workout's own date, as before.

## Data and privacy
- No new tables or columns. `workout_sessions.performed_on` already takes any date.
- Same read and write rules as today's workouts.

## Edge cases
- Offline: the queued start keeps the chosen date.
- Skipping a plan day still uses today.
- After closing a past workout, the home screen lists today only; the past one is in Records.

## Out of scope
- Changing the date of a workout already logged.
- Skipping a past plan day.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/training/pastWorkout.test.tsx` |
