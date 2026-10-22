# T-082g: Soreness timing and pump

Status: built
Task: [T-082g](../tasks/TASKS.md)

## Problem
Soreness shows up a day or two after a workout. Asking right after the workout gets the wrong answer.
RP asks at the muscle's first set in the next workout. Pump is felt during the workout, so it is asked after it.

## Acceptance criteria
1. Given strength and healing answers, when the week is reviewed, then sets change by the table below.
2. Given a low pump and early healing, then one more set is added; a pump alone never adds a set.
3. Given no healing answer, then one more set only when getting stronger.
4. Given old answers (fresh, a bit sore, very sore), then they are read as healed early, just in time and still sore.
5. Given healing on one row and effort on another, then the week joins the latest of each.
6. Given a muscle with history, when its first exercise opens, then "How did your chest heal since last time?" shows once.
7. When the person answers, then it is saved on today's workout and the question goes away.
8. After the workout, the sheet asks effort and an optional pump, not soreness; both answers sit on one row.
9. The database keeps healing-only and effort-only rows and rejects unknown values.

## Rules and reasons
Checked in this order:
| Answer | Change | Reason shown |
|---|---|---|
| Something hurt | -2, suggest a swap | Something hurt, so we cut sets and suggest a different exercise. |
| Weaker twice in a row | -2, easier workout | You got weaker two workouts in a row. So we cut sets and add an easier workout. |
| Weaker once | 0 | You were a little weaker once. Sets stay the same to see if it happens again. |
| Still sore | 0, or -1 if twice this week | Still sore from last time, so sets stay the same. |
| Felt hard | 0 | It felt hard, so sets stay the same. |
| Stronger and healed early | +2 (beginners +1) | Getting stronger and healing early, so two more sets. |
| Same strength, healed just in time | 0 | Same strength and healed just in time. Sets stay the same. |
| No healing answer | +1 if stronger | Getting stronger, so one more set. |
| Anything else | +1 | Healing well, so one more set. |

Low pump with early healing adds one more set, up to the cap.

## Data and privacy
- Migration `20261129000000_soreness_timing.sql` on `muscle_feedback`: `recovery` and `effort` may be empty, but not both; new healing values; new optional `pump` column.
- Same RLS as before: the person, their coach and admin.

## Edge cases
- Offline: the answer is saved with the rest of the workout.
- A past workout never asks the question.
- No history for the muscle: no question.
- The question goes away once a set for that muscle is logged.

## Out of scope
Muscle priority (T-082h) and beginner weight steps (T-082j).

## Tests
| Criterion | Test file |
|---|---|
| 1–5 | `src/engine/sorenessTable.test.ts` |
| 6–8 | `src/training/sorenessTiming.test.tsx` |
| 9 | `src/db/sorenessTiming.test.ts` |
