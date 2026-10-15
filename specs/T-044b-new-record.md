# T-044b: "New record" during a workout

Status: built; agreed (DK, 15 Oct 2026: "go by the logical sequence of task")
Task: [T-044b](../tasks/TASKS.md)

## Problem
Records and progress (T-044) shows best lifts after the workout. People want
to know in the moment when a set beats their best, as it keeps them going.

## Acceptance criteria
1. Given earlier workouts with an exercise, when the person logs a working set
   heavier than any before, then a note under the exercise says "New record:
   heaviest weight." and the old best.
2. Given a set that is not heavier but beats the best estimated one-rep max,
   then the note says "New record: best estimated one-rep max" with the new
   and old values.
3. Given an exercise done with no weight, when a set has more reps than any
   before, then the note says "New record: most reps in a set" with the old
   best.
4. Given a record set earlier in this workout, when the next set only matches
   it, then no note shows. Sets logged today count towards the best.
5. Given a warm-up or drop set, or no earlier workout with this exercise, then
   no note shows.
6. Given the record set is removed, then its note goes away.

## Rules and reasons
- Only working sets count, as in Records and progress (T-044).
- Heaviest weight comes first, then the estimated one-rep max, then reps. Only
  one note shows for a set.
- The first workout with an exercise sets the starting point, so it shows no
  record.
- The one-rep max is estimated the same way as in T-044 (Epley, 12 reps or
  fewer, rounded to 0.5 kg).

## Data and privacy
- No new tables or columns. Nothing new is stored.
- One query per exercise in the workout reads its history (up to 200
  workouts), the same query Records and progress uses. No query inside a loop.

## Edge cases
- Offline or the history fails to load: no record note shows. The set still
  saves as usual.
- A second workout on the same day: only days before today count as earlier
  workouts, plus the sets of the open workout.

## Out of scope
- Records for "heaviest for N reps".
- Sounds or animations.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 5 | `src/engine/strength.test.ts`, `src/training/Records.test.tsx` |
| 6 | `src/training/Records.test.tsx` |
