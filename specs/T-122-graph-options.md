# T-122: More graph choices, with volume

Status: built
Task: [T-122](../tasks/TASKS.md)

## Problem
DK found only two graph choices for leg press. Choices with weight were hidden when no set had weight.
DK also asked for volume graphs, with "volume" in their names (2026-10-21).

## Acceptance criteria
1. Given an exercise, then the graph lists every choice, even with nothing logged.
2. Given a weight choice with no weight logged, then the graph says to log a set with weight.
3. The volume choices are named "Best set volume (weight × reps)" and "Total volume (all sets)".
4. Given an exercise, when "Total sets" is picked, then it shows working sets each workout. Warm-ups and drop sets are left out.
5. Given the records page, then a "Training volume" graph shows workout volume for all exercises. Warm-ups, cardio and assisted machines are left out.
6. Given the records page, when "Weekly sets" for a muscle is picked, then it shows sets each week. The main muscle counts 1, a helper muscle counts half.
7. The training volume graph reads its workouts once for each time range, never once per day.
8. The graph dropdown uses the Calm Ocean look: a soft field, blue arrow and focus ring.

## Rules and reasons
- Helper muscles count half a set, as the weekly limits in the plan editor do (T-082d).
- Drop sets add to volume, since the weight was moved. They are not hard sets, so weekly sets leave them out.
- Assisted weight is help, not load, so it never adds to volume.
- Weeks start on Monday.

## Data and privacy
- No database change. One new read of the user's own sets in a date range, under the existing row rules.

## Out of scope
- Volume targets on this graph. The plan editor already shows weekly limits.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/Records.test.tsx` |
| 4-6 | `src/engine/volumeHistory.test.ts` |
| 5-7 | `src/training/trainingVolume.test.tsx` |
| 8 | CSS only, no automated test |
