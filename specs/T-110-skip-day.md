# T-110: Skip a workout day

Status: built
Task: [T-110](../tasks/TASKS.md)

## Problem
Since T-107, block weeks move on by workouts done. A day the person can't train holds the whole plan back. There was no way to say "I'm skipping this one". RP lets people skip a day, and the plan moves on.

## Acceptance criteria
1. Given a plan, the app shows the next day: the one after the last day done or skipped. "Skip" on that day saves the skip. The plan then moves to the day after it.
2. Given a skip, then it counts towards the block week, like a workout done. Today's list shows "Skipped" with the reason.
3. Given skips in the last 7 days, the week review says how many and why.
4. Given a skip, then the calendar and records do not count it as a workout.
5. Given the skip can't be saved, then the app says so and keeps the screen open.
6. The database keeps the skip and an optional reason of up to 100 letters. A reason needs a skip.

## Rules and reasons
- The reason is optional: Busy, Ill, Travel, Too sore, or the person's own words.
- Days run in plan order and start again after the last day.
- A skip has no sets, so it never changes progress, records or set advice.

## Data and privacy
- Migration `20261122000000_skip_day.sql` adds `workout_sessions.skipped` and `skip_reason`. Same row rules as other workouts. A coach sees skips in the client's workout list. "Download my data" includes them.

## Edge cases
- Skipping needs a connection. It is rare, and it changes which day comes next.
- A one-day plan stays on its one day.
- A new block starts again from the first day.

## Out of scope
- Moving a skipped day to another date.

## Tests
| Criterion | Test file |
|---|---|
| 1-5 | `src/training/skipDay.test.tsx` |
| 6 | `src/db/skipDay.test.ts` |
