# T-044: Records and strength graphs

Status: built; agreed (DK, 13 Oct 2026: "go ahead with prefered" after T-043b)
Task: [T-044](../tasks/TASKS.md)

## Problem
People log every set but can't see if they are getting stronger. They want
their best lifts, a graph for each exercise, the days they trained, and a
quick way to know which plates to put on the bar.

## Acceptance criteria
1. Given logged workouts, when the person opens "Records and progress" from
   the Training tab, then a calendar shows the current month with the days
   they trained marked, and how many workouts that month. "‹" and "›" move
   to other months.
2. Given the calendar, when the person taps a marked day, then the workouts
   of that day show with their names and number of exercises.
3. Given logged workouts, then "Your exercises" lists every exercise done in
   the last year, the latest first, with the date it was last done.
4. Given an exercise, when the person taps it, then its records show: the
   heaviest weight, the best estimated one-rep max, the most reps in a set,
   and the heaviest weight for at least 1, 2, 3, 5, 8, 10 and 12 reps, each
   with its date.
5. Then a graph shows the best estimated one-rep max of each workout over
   time. For an exercise done with no weight, it shows the most reps instead.
6. Given a weight and a bar (20, 15 or 10 kg), when the person uses the
   plate calculator, then it shows the plates for each side from Indian gym
   plates (25, 20, 15, 10, 5, 2.5 and 1.25 kg). Given a weight that can't be
   loaded exactly, it shows the closest lower weight and says so.
7. Given a barbell exercise in a workout, when the person enters a weight,
   then the plates for each side show under the set row, for a 20 kg bar.

## Rules and reasons
- Only working sets count. Warm-ups and drop sets are left out, as in the
  rest of the logger.
- The one-rep max is estimated with the Epley formula from sets of 12 reps
  or fewer. Reason shown: "Estimated from sets of 12 reps or fewer. Higher
  reps give a poor guess." A single rep counts as its own weight.
- "Heaviest for 5 reps" means the heaviest weight lifted for 5 reps or more.
  A set of 8 at 60 kg also proves 5 reps at 60 kg.
- Plates per side use the largest plates first. Weights that can't be made
  exactly round down, never up, so the bar is never heavier than planned.

## Data and privacy
- No new tables. Migration `20261021000000_workout_indexes.sql` adds indexes
  that were missing: `workout_sessions (user_id, performed_on)` and
  `set_logs (session_id)`, used by every workout query and by row-level
  security.
- One query reads the person's workouts for a date range (month or year)
  with their exercise ids. One query reads one exercise's history, up to 200
  workouts. No query inside a loop.
- Row-level security unchanged: the person, or their active coach.
- Nothing new is stored.

## Edge cases
- Offline: the calendar uses the days kept on the phone. Exercise records
  need a connection and say "Couldn't load your records. Check your
  connection."
- No workouts yet: "Log a workout to see your records."
- An exercise done only with no weight: no weight records, only the most
  reps.
- A weight below the bar: "The bar alone weighs 20 kg."

## Out of scope
- A "New record" note during a workout: built in [T-044b](T-044b-new-record.md).
- Choosing which plates a gym has.
- Coach screens and comparing people.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/training/calendar.test.ts`, `src/training/Records.test.tsx` |
| 3, 4, 5 | `src/engine/strength.test.ts`, `src/training/Records.test.tsx` |
| 6 | `src/engine/plates.test.ts`, `src/training/Records.test.tsx` |
| 7 | `src/training/Records.test.tsx` |
| Data | `src/training/training.test.ts`, `src/training/offlineStore.test.ts`, `src/db/rls.test.ts` |
