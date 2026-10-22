# T-128: Open a past workout to edit or delete it

Status: built
Task: [T-128](../tasks/TASKS.md)

## Problem
Only today's workouts could be opened. A past workout could not get more sets, lose a wrong set, or be deleted.

## Acceptance criteria
1. Given a past workout, when "Open" is tapped on its calendar day, then it opens with its sets.
2. Given an open past workout, when sets are added or removed, then they save on that day.
3. Given an open past workout, when it is deleted after a second tap, then it is gone and the calendar shows it gone.
4. Given an open past workout, when Done is tapped, then it goes back to Records without the "how do your muscles feel" questions.

## Rules and reasons
- Those questions are about today's recovery. So a past workout does not ask them.
- Live clocks stay hidden, as for any past workout (T-126).

## Data and privacy
- No database change. The calendar reads one day only when Open is tapped.

## Edge cases
- Offline: the day opens from the copy kept on the phone, if there is one; otherwise it says it couldn't open.

## Out of scope
- Changing a workout's date, or editing a set in place.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/training/openPastWorkout.test.tsx` |
