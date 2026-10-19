# T-082f: Back after a break

Status: built
Task: [T-082f](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.9

## Problem
After time off, the app still asked for last time's weight, or more. That
is too heavy after weeks away and can lead to missed sets or injury.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given under 10 days off an exercise, the normal step applies.
2. Given 10 to 20 days off, the start is 10% lighter at the same reps,
   with the reason.
3. Given 21 to 42 days off, the start is 20% lighter. Given 43 or more, it
   is 30% lighter.
4. The lighter weight rounds down to the weight step, and reps stay inside
   the range.
5. With no date for today, nothing changes.
6. In a session, the lighter start shows with its reason and fills the set.

## Rules and reasons
- Days off count from the last session with working sets of that exercise.
- Reason: "You had 22 days off. So start 20% lighter today."
- After one session back, normal steps take over from the lighter weight.
- The steps are cautious picks. Dr. Muscle also starts at 10 days off.

## Data and privacy
- No data changes.

## Out of scope
- Restarting the whole block after a long break (the review already offers a new block).
- Light week choice: week-1 weights or the same weight with 3 reps left (T-082n).
- Illness advice (T-046).

## Tests
- `src/engine/afterBreak.test.ts` (1-5)
- `src/training/Workouts.test.tsx` "back after a break (T-082f)" (6)
