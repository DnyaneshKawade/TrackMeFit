# T-104: Add a missed weigh-in or measurement

Status: built
Task: [T-104](../tasks/TASKS.md)

## Problem
People forget to weigh in some days. DK asked for a way to add an earlier
day's weight on the Progress tab, so the trend stays complete.

## Acceptance criteria
1. Given the Progress tab, when the person taps "Missed a day? Add an earlier weight" and picks a day, then the weight saves for that day, and the form goes back to today.
2. Given a day after today, or more than a year back, when they save, then nothing is saved and the app says why.
3. Given the measurements form, when they pick an earlier day, then the measurements save for that day.

## Rules and reasons
- Days from one year back up to today are allowed. "Pick today or an earlier day." or "Pick a day in the last year."
- Picking a day that already has a weight fills it in, and the button says Update.

## Data and privacy
No database change. `weigh_ins` and `measurements` already keep one row per person per day.

## Edge cases
- Offline: the save fails with the usual "Couldn’t save" message.
- The trend and chart sort by date, so an earlier day lands in the right place.

## Out of scope
Back-dated food or workouts. The Today tab already moves between days.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/progress/Progress.test.tsx` |
