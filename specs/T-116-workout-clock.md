# T-116: Workout clock

Status: built
Task: [T-116](../tasks/TASKS.md)

## Problem
People like to see how long a workout has run. FitNotes shows a clock from the first set.

## Acceptance criteria
1. Given a new workout, then no clock shows before the first set. The app does not keep the screen on.
2. Given a new workout, when the first set is logged, then a clock starts at 0:00 and counts up each second.
3. The start time is kept once per workout on this phone. Start times older than 2 days are cleared.

## Rules and reasons
- The clock starts at the first set, not when the workout opens. Setting up is not training.
- It is a per-phone convenience. If storage is off, it still works until the page reloads.
- A workout opened on another phone shows no clock, since its start time is not known here.
- Keeping the screen on was dropped. DK decided the phone should sleep as usual (2026-10-20).

## Data and privacy
- No database change. The start time lives only on the phone.

## Out of scope
- Keeping the screen on.
- Saving workout length to the database or showing it in history.

## Tests
| Criterion | Test file |
|---|---|
| 1-3 | `src/training/workoutClock.test.tsx` |
