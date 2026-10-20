# T-107: Block weeks counted by workouts done

Status: built
Task: [T-107](../tasks/TASKS.md)

## Problem
The block week counted days since the block began. Miss a week of training and the app moved you to the next week anyway. RP counts workouts done instead. Indian schedules are often uneven, so a missed day should wait.

## Acceptance criteria
1. Given no workouts for two weeks, when the plan shows its week, then it is still week 1.
2. Given workouts on the plan's days, when the week is worked out, then only this block's plan workouts count, and two on one day count as two.
3. Given a start date still ahead, then it is the light week; given a coach starts a client at week 3, then the block starts at week 3 today.
4. Given the workouts can't load, then the week falls back to counting days.

## Rules and reasons
- One week = one workout for each day in the plan. A 3-day plan moves to week 2 after 3 workouts.
- Workouts not from the plan (empty workouts) don't count.
- The light week after the hard weeks also ends by workouts done.

## Data and privacy
- Migration `20261119000000_block_start_week.sql` adds `workout_plans.block_start_week` (1-12, default 1). Same row rules as the plan.
- Workout summaries now carry `plan_day_id`, already readable by the person and their coach.

## Edge cases
- Blocks started before this change count workouts from their start date. A coach-started block keeps week 1 as its start.
- Offline: the plan uses the workouts kept on the phone, or else days.

## Out of scope
- "Skip this workout" (T-110) and block controls (T-109).

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/blockWeeks.test.tsx` |
