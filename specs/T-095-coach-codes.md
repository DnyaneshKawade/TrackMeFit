# T-095: Coach codes list

Status: built
Task: [T-095](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
A coach saw only the last code they made. Older codes still worked for 7
days, and there was no way to stop one sent to the wrong person.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The Clients tab lists codes not used yet, with the day each one ends.
   Cancel removes a code so nobody can use it.
2. A coach lists and cancels only their own codes. A cancelled code can't
   be used.

## Rules and reasons
- A used code is removed when someone joins, so it leaves the list. That
  person then shows under Your clients. Keeping who used which code would
  need a new column; the client list already answers "who joined".
- Row-level security already lets a coach read and delete only their own
  codes.

## Data and privacy
- No migration.

## Tests
- `src/coach/Clients.test.tsx` "coach codes list (T-095)" (1)
- `src/db/coach.test.ts` "coach codes list (T-095)" (2)
