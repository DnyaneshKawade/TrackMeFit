# T-042a2: People page

Status: built
Task: [T-042a2](../tasks/TASKS.md)
Plan: [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a), phase 1

## Problem
DK needs to help people without opening the Supabase console: find an
account, block a spammer, sign someone out of a lost phone, resend a lost
confirm email, end a coach link, fix a wrong role, or delete an account.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given an owner with the second step, then they search people by name,
   email or phone, newest first, and see account facts only (no health data).
2. Given many people, then the list pages 50 at a time from the last row,
   even when two people joined at the same instant.
3. Given a person, a coach, or an owner without the second step, then every
   People action is refused and writes no log row.
4. Given an owner, then sign out, block, unblock, resend confirm, end coach
   link and change role each write one log row. Sign out, block and delete
   end every session.
5. Given an unsafe action (block or delete yourself or an admin, resend to a
   confirmed email, no reason, an unknown action), then it is refused with no
   log row.
6. Given the server function, then the database checks and logs first; only
   then does it block, unblock, delete (photos first) or resend.
7. Given a refused caller, then the server function does nothing else.
8. Given a bad request, then the server function stops before anything runs.
9. Given an Auth admin error after the log row, then it says the action failed.
10. Given the People page, then it lists people with email, phone, role,
    status, joined, last seen and coach, and searches.
11. Given more than 50 people, then "Show more" loads the next 50.
12. Given each action on the page, then it asks for a reason and is saved in
    the admin log.
13. Given a refused action, then the page says why in plain words.

## Rules and reasons
- Block, unblock, delete and resend need the Auth admin API. They run in the
  `admin-account` Edge Function, where Supabase holds the service key. The
  key never reaches the browser.
- The function calls `admin_account_action` with the admin's own session
  first. That checks owner and second step, writes the log row and ends
  sessions. If it refuses, nothing else runs.
- A block lasts until someone unblocks.
- Delete removes photo files first, then the account. All rows go with it.
- Admins can't be blocked or deleted. Remove them as admin first.
- A coach with active clients can't be moved to "For myself".

## Data and privacy
- Migration `20261106000000_admin_people.sql`: `admin_people`,
  `admin_account_action`, `admin_end_coach_link`, `admin_set_role`, and an
  index on `coach_clients (client_id, status)`.
- Edge Function `supabase/functions/admin-account`.
- The page shows email, phone, name, role, joined, last seen, blocked,
  confirmed, set-up done, coach and admin level. Nothing else.

## Edge cases
- Search with % or _ treats them as letters.
- An action fails after its log row: the page says to try again; the row
  shows it was tried.
- Deleting a person with many photos removes them 100 at a time.

## Out of scope
- Coach statuses and approval (T-042a3). View as a person (T-042a4).
- Data export and requests (T-042a5).

## Tests
| Criterion | Test file |
|---|---|
| 1–5 | `src/db/admin.test.ts` (people page) |
| 6–9 | `src/admin/accountFunction.test.ts` |
| 10–13 | `src/admin/People.test.tsx` |
