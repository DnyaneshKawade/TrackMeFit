# T-114: Cardio sets

Status: built
Task: [T-114](../tasks/TASKS.md)

## Problem
Many people walk, run or use a treadmill, bike or rower at the gym. The app only took weight and reps. FitNotes logs cardio as time and distance.

## Acceptance criteria
1. A time is typed as minutes ("25"), minutes and seconds ("25:30") or hours ("1:05:00"). Anything else is not a time.
2. A time is needed, up to 6 hours. A distance is more than 0 and up to 100 km. Problems are shown in plain words.
3. An entry shows as "3 km in 25:00 · 7.2 km/h", or just the time.
4. Records show the farthest, longest and fastest entries. Fastest needs at least 1 km.
5. The database keeps a time of 1 second to 6 hours and a distance up to 100 km. A distance needs a time. A cardio set has no weight, reps, tag or mini-sets.
6. Given a workout, when the person taps "+ Add cardio", picks a move and logs a time and distance, then it is saved with no weight or reps. A cardio-only workout asks no muscle questions.
7. Given a move with no distance, like skipping, then only the time box shows. No time gives an error.
8. Records and progress lists cardio by name. Its page shows the records and past entries.
9. The app reads the time and distance from the database row.

## Rules and reasons
- Cardio has its own short list of 10 moves, apart from strength exercises. So it never counts as sets for a muscle, and plans, swaps and advice skip it.
- Cardio is never in a superset and is not copied by "Copy a past workout".
- Distance is in km for everyone for now.

## Data and privacy
- Two columns on `set_logs`: `duration_sec` and `distance_km`. Row-level security is unchanged. Sets are already in "Download my data".

## Edge cases
- A comma works as a decimal point in the distance.
- A workout with only cardio still shows on the calendar.

## Out of scope
- Cardio in plans, calories burnt from cardio, heart rate and miles.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/engine/cardio.test.ts` |
| 5 | `src/db/cardioSets.test.ts` |
| 6-9 | `src/training/cardioSets.test.tsx` |
