# T-082a: Four more muscles

Status: built
Task: [T-082a](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.1

## Problem
The engine counted 12 muscles. Front raises counted as side delt work, so
side delt sets looked higher than they were. Forearm, inner thigh and neck
moves had no muscle to count for.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a plan with front raises, they count for front delts, not side
   delts.
2. Given a plan with shoulder presses, they count as half sets for front
   delts.
3. Given the new muscles, each has a name and its own exercises. Search
   finds "wrist curl", "adductor", "inner thigh" and "neck".
4. Given any plan, the app adds no sets for the new muscles on its own.
   Neck work is only for people who pick it.
5. Given the database, feedback and own exercises take every muscle the
   app has, and no others.

## Rules and reasons
- Presses and compound lifts train these muscles already. So each starts at
  0 sets a week, and only grows when the person adds it.
- Week limits (sets): front delts up to 12, forearms 24, inner thighs 16,
  neck 16. Forearm, inner thigh and neck limits are starting guesses.
- Shoulder presses keep side delts as the main muscle, so plans people
  already have keep the same counts.
- Farmer's walk and reverse curls now count for forearms.

## Data and privacy
- Migration `20261110000000_more_muscles.sql` widens the muscle checks on
  `muscle_feedback` and `custom_exercises`. No data changes.

## Edge cases
- Old feedback rows keep their muscle names; every old name is still
  allowed.

## Out of scope
- Using reps left to pick the weight (T-082b) and the other research tasks.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4 | `src/training/moreMuscles.test.ts` |
| 5 | `src/db/moreMuscles.test.ts` |
