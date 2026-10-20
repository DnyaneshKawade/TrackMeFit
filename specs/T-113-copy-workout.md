# T-113: Copy a past workout

Status: built
Task: [T-113](../tasks/TASKS.md)

## Problem
People often repeat a past workout, especially without a plan. Typing every weight and rep again is slow. FitNotes lets people copy a past workout, then change it.

## Acceptance criteria
1. Given a workout, when the person taps "Copy a past workout", picks one and ticks exercises, then those exercises appear. Their boxes fill with the first copied set. Nothing is logged yet.
2. Given copied sets, when a set is logged, then the next copied set fills the boxes. The person can change any box before logging.
3. The list shows workouts from the last 90 days, newest first, up to 20. Skipped days and empty workouts are left out.
4. Given no past workouts, then the app says so.

## Rules and reasons
- Copying never logs a set. Sets count only when the person does them. This keeps records and progress true.
- Warm-ups are left out of the copy when there are working sets.
- It reads one workout list and one day's sets. No query per exercise.

## Data and privacy
- No new data. It reads the person's own workouts.

## Edge cases
- An exercise no longer in the list can't be copied.
- Copying again replaces the earlier copy.

## Out of scope
- Copying a coach's or another person's workout.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/copyWorkout.test.tsx` |
