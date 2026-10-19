# T-082b: Weight steps from reps left

Status: built
Task: [T-082b](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.2

## Problem
The next weight came only from the reps done. Someone who did 8 reps with 4
reps left was told to aim for 9, when they could lift more. Someone who went
to failure was told to add a rep.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given sets inside the rep range with 2 or more reps left above the aim,
   the weight goes up now. The reason names both numbers.
2. Given sets with fewer reps left than the aim, the weight and reps stay
   the same.
3. Given no reps left logged, the old rules stay.
4. Given the top of the range, two misses, a set below the range, or a big
   next jump, the old rules win.
5. Given last time's logged reps left, they reach the suggestion.

## Rules and reasons
- The aim is this week's reps left from the plan's block: 3, 2, 1, 1. With
  no plan, the aim is 2.
- People guess reps left about 1 off (Halperin 2022). So only a gap of 2 or
  more adds weight.
- The average reps left of the top-weight sets, rounded, is compared.
- No weight goes up in a light week, as before.

## Data and privacy
- No data changes. Reps left were already saved with each set.

## Edge cases
- Some sets with reps left and some without: only the logged ones count.

## Out of scope
- A check that people guess reps left well (T-082k).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4, 5 | `src/engine/repsLeft.test.ts` |
