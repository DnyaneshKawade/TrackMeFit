# T-116: Keep the screen on, and a workout clock

Status: built
Task: [T-116](../tasks/TASKS.md)

## Problem
A phone screen turns off between sets. Then the person must unlock it to log the next set. FitNotes keeps the screen on and shows how long the workout has run.

## Acceptance criteria
1. Given a phone with Wake Lock, when a workout is open, then the screen stays on. The lock is asked for again when the app shows. It is let go when the workout closes.
2. Given the workout, when the person taps "Screen stays on", then the screen may sleep. The choice is kept on this phone.
3. Given a phone without Wake Lock, then no switch or clock shows, and the workout works as before.
4. Given a new workout, when the first set is logged, then a clock starts at 0:00 and counts up each second.
5. The start time is kept once per workout on this phone. Start times older than 2 days are cleared.

## Rules and reasons
- The clock starts at the first set, not when the workout opens. Setting up is not training.
- Both are per-phone conveniences. If storage is off, they still work until the page reloads.
- A workout opened on another phone shows no clock, since its start time is not known here.

## Data and privacy
- No database change. The start time and the switch live only on the phone.

## Edge cases
- The phone drops the lock when the app is hidden. It is asked for again on return.

## Out of scope
- Saving workout length to the database or showing it in history.

## Tests
| Criterion | Test file |
|---|---|
| 1-5 | `src/training/workoutClock.test.tsx` |
