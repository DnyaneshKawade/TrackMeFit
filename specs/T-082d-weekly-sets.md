# T-082d: Weekly sets per muscle

Status: built
Task: [T-082d](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.10

## Problem
When making a plan, people could not see how many sets each muscle gets in a
week. Too few sets gives little growth; too many is hard to recover from.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a muscle with fewer sets than its lowest useful amount, it shows as
   low, with the range to aim for.
2. Given a muscle in its range, it shows as good. Above the range it shows
   as high, and at its limit as too many.
3. Given a plan, only trained muscles show, most sets first. Helper muscles
   count as half a set.
4. Given the plan editor, the weekly sets show under the days and change as
   sets change.

## Rules and reasons
- The limits are the engine's own (`LANDMARKS`): low under the starting
  amount, good up to the top of the best range, high above it, too many at
  the most a person can recover from.
- Muscles that need no sets of their own, like glutes, are never low.
- Helper muscles count half (Pelland 2024).

## Data and privacy
- No data changes.

## Out of scope
- The same view on the weekly review.
- Each person's own learned limits (T-046).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/engine/volume.test.ts` |
| 4 | `src/training/Workouts.test.tsx` |
