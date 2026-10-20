# T-109: Block controls

Status: built
Task: [T-109](../tasks/TASKS.md)

## Problem
Every block had 4 hard weeks, and nobody could change it. A block could only end through the week review. Starting a new block meant waiting for the light week. RP lets people set the block length, end it early and copy it into the next block with swaps.

## Acceptance criteria
1. Given a plan, when the person opens "Block", then they can pick 3, 4, 5, 6 or 7 hard weeks. The choice is saved.
2. Given a block in its hard weeks, when the person taps "Light week now", then the light week starts today. It is not offered again during the light week.
3. Given any week, when the person taps "Start next block", then the plan starts again at week 1 today. Only the swaps they ticked change exercises. Sets and reps stay the same.
4. Given a light week, then traps and forearms exercises say they can be skipped. Other exercises still get half sets.
5. The database keeps 3 to 7 hard weeks, 4 by default.

## Rules and reasons
- 3 to 7 hard weeks covers what RP and most coaches use. Most people do 4 to 6.
- Swaps use the same rule as other swaps: same main muscle and kind, never an exercise already in the plan.
- The next block uses the same plan, so workout history stays linked to it. No copy is made.
- Traps and forearms get work from rows, pulls and carries, so a light week can drop them.

## Data and privacy
- Migration `20261121000000_block_hard_weeks.sql` keeps `workout_plans.hard_weeks` between 3 and 7 (it was 1 to 8). Saved plans now write this number.
- No new data is collected.

## Edge cases
- Older plans all have 4 hard weeks. Any value out of range is moved into 3 to 7.
- A coach template keeps its own hard weeks when copied to a client.

## Out of scope
- Building a block by muscle priority (T-114).
- Skipping one workout day (T-110).

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/blockControls.test.tsx` |
| 5 | `src/db/blockHardWeeks.test.ts` |
