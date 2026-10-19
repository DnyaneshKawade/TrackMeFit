# T-082c: Warm-up sets

Status: built
Task: [T-082c](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.4

## Problem
People had to work out warm-up weights in their head, and plate math made
it slow. Many skipped warm-ups or did too many.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a heavy barbell lift, warm-ups are the bar, then 50, 70 and 85% of
   the working weight, rounded down to plates the gym has.
2. Given 9 or more working reps, the 85% step is left out.
3. Given a muscle an earlier exercise already trained today, a big lift gets
   one set at 70% and a small one gets none.
4. Given a machine, warm-ups round down to its weight steps.
5. Given a light bar, it gets the bar once. Very light weights and body
   weight get none.
6. Given a session, warm-ups show before the first working set. Tapping one
   fills the set as a warm-up. After logging it, the working weight comes
   back. They go away after the first working set.

## Rules and reasons
- Warm-ups build to the suggested weight, or last time's first working set.
  With no history, none show.
- A step too close to the last one or to the working weight is left out.
- Warm-ups are logged with the warm-up tag, so they never count as work.
- There is little research on warm-up schemes. These steps follow common
  practice, as in Strong and Alpha Progression.

## Data and privacy
- No data changes.

## Out of scope
- Picking a different bar weight for warm-ups.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4, 5 | `src/engine/warmup.test.ts` |
| 6 | `src/training/Workouts.test.tsx` |
