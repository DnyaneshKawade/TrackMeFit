# T-103: "I want to coach"

Status: built
Task: [T-103](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The role was picked once at sign-up, and "You can't change this later."
Someone who starts coaching friends had no way in, except a second account.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. An adult who isn't a coach asks from the Account page, once. They then
   see that the request is waiting. Coaches and teens can't ask.
2. The owner sees it under Requests, marked "Wants to coach". "Make coach"
   needs an answer. It makes them a coach, closes the request and logs it.
3. Someone with a coach must end that link before they become a coach.

## Rules and reasons
- It uses the data requests table with a new `kind`, so requests stay in
  one list with the same 90 days to answer.
- A new coach then goes through the usual check (T-042a3).
- The role step now says "Want to coach later? Ask us on the Account page."

## Data and privacy
- Migration `20261115000000_coach_requests.sql`: `data_requests.kind`, one
  open coach request a person, a rule that only adults who aren't coaches
  ask, `admin_requests` with the kind, and `admin_make_coach`.

## Tests
- `src/db/coachRequests.test.ts` '"I want to coach" (T-103)' (1, 2, 3)
- `src/account/Account.test.tsx` '"I want to coach" (T-103)' (1)
- `src/admin/Requests.test.tsx` '"I want to coach" (T-103)' (2)
