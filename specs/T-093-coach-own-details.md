# T-093: Coaches change their own details after approval

Status: built
Task: [T-093](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The details form showed only while a coach waited for a check. Once
Approved, a coach could not change their name, phone, city, years, link or
certificates.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. An Approved coach opens "Your coach details" under their clients,
   changes them and saves. The status stays Approved.
2. In the database, an Approved coach changes their name and details, and
   the status stays Approved.

## Rules and reasons
- The same form as before approval, now with "Name your clients see".
  The name is the profile name, which clients see in "Your coach".
- Changing details does not send the coach back for a check. Owners can
  still pause a coach if something looks wrong.

## Data and privacy
- No migration. Row-level security already lets a coach change only their
  own details and name.

## Tests
- `src/coach/CoachStatus.test.tsx` "coaches change their own details (T-093)" (1)
- `src/db/coachApproval.test.ts` "coaches change their own details (T-093)" (2)
