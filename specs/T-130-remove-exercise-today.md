# T-130: Remove a planned exercise from today's workout

Status: built
Task: [T-130](../tasks/TASKS.md)

## Problem
A plan day lists its exercises. Sometimes a machine is busy or something hurts. People need to drop one exercise for today and add another, without changing the plan.

## Acceptance criteria
1. Given a workout from a plan day, when ✕ is tapped on an exercise, then it leaves this workout, and Undo brings it back. The plan keeps it.
2. Given an exercise was removed, when another is added, then it shows in this workout.
3. Given an exercise has logged sets, then it has no ✕.
4. Given an exercise was removed, when the workout is opened again, then it stays out.
5. Given many workouts, then only the last 10 workouts' removals are kept on the phone.

## Rules and reasons
- Logged sets are never hidden. To drop an exercise with sets, remove its sets first.
- Only today's workout changes. To change every week, edit the plan.

## Data and privacy
- No database change. Removals are kept on this phone only, like the workout clock.

## Edge cases
- Storage off: the exercise stays out until the page reloads.
- On another phone, the removed exercise shows again with no sets. Nothing is lost.

## Out of scope
- Swapping an exercise for one with the same muscle in one tap.

## Tests
| Criterion | Test file |
|---|---|
| 1–5 | `src/training/removeExercise.test.tsx` |
