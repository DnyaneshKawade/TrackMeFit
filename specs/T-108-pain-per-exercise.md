# T-108: "Something hurt" per exercise

Status: built
Task: [T-108](../tasks/TASKS.md)

## Problem
After a workout, the app asked "Something hurt" once per muscle. It could not tell which lift hurt. So the review could only say "try a different exercise for this muscle". RP asks about joint pain per exercise and swaps only that lift.

## Acceptance criteria
1. Given a workout with bench press and lat pulldown, when the feedback sheet opens, then each exercise gets its own "Something hurt" box under its main muscle. Only ticked exercises are saved as hurt.
2. Given bench press hurt, when the week review opens, then it names bench press and a similar exercise to swap to. The plan changes only after "Apply these changes". Sets and reps stay the same.
3. Given older answers that only say the muscle hurt, then the review still says to try a different exercise for that muscle.
4. Given an exercise that hurt but is not in the plan, then the review names it and leaves the plan alone.
5. The database keeps the exercises that hurt. It is empty by default and holds at most 20.

## Rules and reasons
- The muscle still loses sets when something hurt, as before. The engine's reason stays the same.
- The swap uses the same rule as the swap button in a workout: same main muscle and kind, never an exercise already in the plan.
- Nothing changes in the plan until the person accepts the review.

## Data and privacy
- Migration `20261120000000_pain_per_exercise.sql` adds `muscle_feedback.hurt_exercises` (text list, at most 20). Same row rules as the rest of the feedback. "Download my data" includes it.
- `pain` is still saved, so older app versions keep working.

## Edge cases
- In a light week the review shows only the light-week advice. Swaps wait for the next review.
- No similar exercise: the review asks the person to pick one in the plan.

## Out of scope
- Pain levels (none, low, moderate, a lot). One box is enough for now.
- Asking during the workout instead of after it.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/painPerExercise.test.tsx` |
| 5 | `src/db/painPerExercise.test.ts` |
