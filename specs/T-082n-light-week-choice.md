# T-082n: Light week weights, your choice

Status: built
Task: [T-082n](../tasks/TASKS.md)

## Problem
The light week always said "week-1 weights, stop with 4 reps left". Research note 4.9 offers a second choice: keep the same weight and stop with 3 reps left. Both halve the sets.

## Acceptance criteria
1. Given a light week and "Week-1 weights", then each exercise shows half the sets, week-1 weights and 4 reps left.
2. Given "Same weight, 3 reps left", then each exercise shows half the sets, last time's weight and 3 reps left, and the weight box is filled with last time's weight.
3. Given a beginner, or no weight from last time, then week-1 weights are used.
4. Given a choice is picked, then it is kept for the next light week on this phone.

## Rules and reasons
- `lightWeek` in `src/engine/training.ts` is pure and gives a plain reason.
- Beginners keep the simpler rule: week-1 weights and 4 reps left (inferred, research note 4.9).
- Traps and forearms can still be skipped, as in T-109.
- Week-1 weights is the default, as before.

## Data and privacy
- No database change. The choice is kept on the phone.

## Edge cases
- Storage off: the choice lasts for this workout only.
- A new phone starts with week-1 weights.

## Out of scope
- Saving the choice with the plan for a coach to set.
