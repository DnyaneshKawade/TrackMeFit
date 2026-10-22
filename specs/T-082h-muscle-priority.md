# T-082h: Muscle priority

Status: built
Task: [T-082h](../tasks/TASKS.md)

## Problem
People want to bring up one area, like arms, without adding tiredness everywhere.
RP lets each muscle be Emphasize, Grow or Maintain. Our engine had a `priority` flag but no screen.

## Acceptance criteria
1. Given a "Grow" muscle, when it would pass the top of MAV, then sets stop there with a reason.
2. Given a "Grow more" muscle, then sets may climb to MRV, then hold.
3. Given a "Keep" muscle, then sets come down to its holding sets and never go up.
4. Week-1 sets: Grow more starts at MAV low; Keep starts at its holding sets.
5. The plan editor shows Grow more, Grow and Keep for each muscle the plan trains; Grow is the default.
6. The database saves Grow more and Keep per plan and rejects other values.
7. Picking Grow again removes the saved choice.
8. The week review brings a kept muscle down, even with no answers, only once accepted.

## Rules and reasons
| Priority | Week-1 sets | Top | Reason when it binds |
|---|---|---|---|
| Grow more | MAV low | MRV | This is the most this muscle can heal from, so sets stay. |
| Grow (default) | MEV | MAV high | This is the usual top for this muscle, so sets stay. Pick "Grow more" to go higher. |
| Keep | MV, at least 2 | MV, never adds | You chose Keep, so sets go down to 8. |

- Something hurt still cuts sets and suggests a swap, also for Keep.
- The choice can change at any time in the plan editor, also in the middle of a block. The next review uses it.

## Data and privacy
- Migration `20261130000000_muscle_priority.sql`: `workout_plans.muscle_priority` jsonb, `{}` by default, values only "more" or "keep".
- Same RLS as the plan: the person and their coach.

## Edge cases
- A muscle already above its top holds; it is never cut for being high.
- A muscle that leaves the plan keeps its saved choice; it has no effect.
- Offline: the choice saves with the plan.

## Out of scope
Asking for priorities in the starter plan questions. The starter plan still starts every muscle at Grow.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/engine/musclePriority.test.ts` |
| 5, 7, 8 | `src/training/musclePriority.test.tsx` |
| 6 | `src/db/musclePriority.test.ts` |
