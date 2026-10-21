# T-124: Delete where it was missing, and ask first

Status: built
Task: [T-124](../tasks/TASKS.md)

## Problem
DK asked for a delete option wherever it is needed (2026-10-21).
A review found things that could not be deleted. Some deletes also acted at once, with no question.

## Acceptance criteria
1. Given a day with measurements, when that day is edited, then "Delete this day's measurements" deletes them after asking.
2. Given a removed own exercise, then "Removed exercises" lists it with "Bring back", even after the list was closed.
3. Given saved exercise settings, then "Clear all settings" clears them after asking.
4. Given an open change or coach request, then "Withdraw" deletes it after asking. An answered request has no Withdraw.
5. Removing a weigh-in, photo or certificate, or deleting a plan, asks first.
6. The database lets a person delete only their own request, and only while it is open.

## Rules and reasons
- Every delete asks once in the same place: "Yes, delete" or "Keep".
- A photo says it can't be undone, since the file goes too.
- Deleting a plan says past workouts stay. The plan is only hidden, so history keeps its days.

## Data and privacy
- Migration `20261127000000_withdraw_requests.sql`: lets people delete their own open requests.
- Measurements already had a delete rule for their owner.

## Out of scope
- Editing a set or a food entry in place.
- Removing a diet target or meal plan. A newer one already replaces it.
- Coach delete rules (T-125).

## Tests
| Criterion | Test file |
|---|---|
| 1, 5 | `src/progress/Progress.test.tsx`, `src/progress/Photos.test.tsx` |
| 2-3 | `src/training/moreDeletes.test.tsx` |
| 4 | `src/account/Account.test.tsx` |
| 5 | `src/training/Workouts.test.tsx`, `src/coach/CoachStatus.test.tsx` |
| 6 | `src/db/withdrawRequests.test.ts` |
