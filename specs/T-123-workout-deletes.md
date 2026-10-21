# T-123: Delete a workout, undo a skip, put back a set

Status: built
Task: [T-123](../tasks/TASKS.md)

## Problem
DK asked for a delete option wherever it is needed (2026-10-21).
A wrong or extra workout could not be deleted. A skip could not be taken back.
A set removed by mistake was gone, with no way back.

## Acceptance criteria
1. Given a workout, when "Delete this workout" is tapped, then it asks first and names how many sets go.
2. Given that question, when "Keep it" is tapped, then nothing is deleted.
3. When "Yes, delete" is tapped, then the workout, its sets and its answers are deleted.
4. Given a skipped day, when "Undo skip" is tapped, then the skip is gone and the plan's next day comes back.
5. Given a removed set or cardio entry, then "Undo" shows. Tapping it puts the same set back.
6. Given a workout made offline and not sent, when it is deleted, then nothing for it is sent.
7. Given a saved workout deleted offline, then the delete waits and is sent later.

## Rules and reasons
- A whole workout asks first, since many sets go at once. A single set has Undo instead, which is quicker.
- Undo lasts until the next set is logged on that exercise.
- Sets and muscle answers go with the workout on the server (on delete cascade).

## Data and privacy
- No database change. The "write own" rule already lets people delete their own workouts.

## Out of scope
- Editing a set or a food entry in place.
- Other deletes from the same review (T-124) and the coach delete rules (T-125).

## Tests
| Criterion | Test file |
|---|---|
| 1-5 | `src/training/deleteWorkout.test.tsx` |
| 6-7 | `src/training/offlineStore.test.ts` |
