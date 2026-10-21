# T-117: Assisted machines

Status: built
Task: [T-117](../tasks/TASKS.md)

## Problem
On an assisted pull-up or dip machine, the weight helps the person up. Less weight means they are stronger. The app treated it like any weight, so records, advice and graphs went the wrong way.

## Acceptance criteria
1. Records show "Least help" and "Most reps in a set". Less help wins; with the same help, more reps win. Warm-ups and drop sets are left out.
2. A new record is less help than before, or more reps with the same help. Ties and the first workout give none.
3. The graph shows the least help or the most reps for each workout.
4. History marks sets that beat the best so far, not on the first day.
5. Advice takes help away after the top of the rep range on every set. It adds help after two misses or a break of 10 days or more. With no help left, it says to try the exercise without the machine. Each comes with a reason.
6. In a workout, the card says the weight is help. It suggests less help, skips warm-ups and shows "help" by each set.
7. Records and progress shows least help, a help graph and record marks.

## Rules and reasons
- Assisted pull-ups and assisted dips are assisted machines. Band-assisted pull-ups log no band weight, so they stay as they are.
- Plateau advice and warm-ups read weight as load, so assisted machines skip them.
- The help steps come from the machine's usual step, or the person's own step (T-112).

## Data and privacy
- No database change. The weight column keeps the help in kg.

## Edge cases
- After a break, help goes up 1, 2 or 3 steps for 10, 21 or 43 days off.
- Help never goes below 0.

## Out of scope
- Own exercises marked as assisted.
- Body weight minus help as the lift.

## Tests
| Criterion | Test file |
|---|---|
| 1-5 | `src/engine/assisted.test.ts` |
| 6-7 | `src/training/assisted.test.tsx` |
