# T-082e: Plateau check

Status: built
Task: [T-082e](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.5

## Problem
When a lift stopped going up, the app kept asking for one more rep. It
only acted after two missed sessions. People had no next step.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a new best in any of the last 3 sessions, there is no plateau.
2. Given 3 sessions with no new best and a missed target, the app gives a
   lighter session, 10% off.
3. Given 3 sessions with no new best and few sets for the muscle, the app
   says to add a set.
4. Given 3 sessions with no new best and enough sets, the app says to swap
   at the next block, and names a similar exercise.
5. Gaps over 10 days, a break before today, or body-weight sets give no
   plateau.
6. In a session, the plateau advice shows under the suggestion.

## Rules and reasons
- A session's best is its top estimated one-rep max, counting reps left
  (Epley, up to 12 reps). A new best must beat the earlier best by 1%.
- Sessions must be 10 days apart or less, about once a week.
- "Few sets" means under the low end of the muscle's best range.
- The similar exercise has the same main muscle and kind, and the same kit
  first. It is not one already in today's workout.
- Reasons: "No new best in 3 sessions. This muscle gets 6 sets a week. So
  add one set here."
- The steps follow Dr. Muscle and Stronglifts practice. The thresholds are
  cautious picks.

## Data and privacy
- No data changes. Each exercise now reads its last 6 sessions, not 3.

## Out of scope
- Checking soreness before adding a set (needs T-082g).
- Preferring exercises that train the muscle when stretched (T-082i).
- Doing the swap or adding the set for the user: they change the plan.

## Tests
- `src/engine/plateau.test.ts` (1-5)
- `src/training/Workouts.test.tsx` "plateau check (T-082e)" (6)
