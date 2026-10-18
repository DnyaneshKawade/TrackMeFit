# T-042a1: Admin access

Status: built
Task: [T-042a1](../tasks/TASKS.md)
Plan: [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a), phase 1

## Problem
DK manages the app in the Supabase console today. The admin pages need a
safe base first: who is an admin, a second step at sign-in, and a log of
every admin action that nobody can change.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a sign-up, then it never makes an admin, and nobody can write their
   own admin row.
2. Given a person, a coach, or an admin without the second step, then every
   admin function and the admin log are refused.
3. Given an owner with the second step, then they add, change and remove
   admins, and each action writes one log row with who, what, whom and why.
4. Given a content admin, then they pass the content check but can't manage
   the team or read the log.
5. Given a change with no reason, or one that fails, then nothing changes and
   no log row is written.
6. Given the admin log, then nobody can change or delete a row, the database
   owner included.
7. Given the last owner, then they can't be removed or made a content admin.
8. Given the app, then only admins see the Admin tab.
9. Given an admin without the second step, then the Admin tab asks them to
   set up a code app first (a picture to scan, or a key to type).
10. Given an admin with the step set up, then each sign-in asks for the code.
11. Given an owner, then the Admin team page adds, changes and removes admins,
    each with a reason.
12. Given the last owner, then the page says there must always be one owner.

## Rules and reasons
- Two levels: content (foods, exercises, review queue, banners, all later)
  and owner (people, roles, data requests, plus all content work).
- The second step is a 6-digit code from an app like Google Authenticator
  (Supabase TOTP). The database checks the session used it (`aal2`).
- A stolen password alone can't open admin pages or data.
- Hiding the tab is only a convenience. The database rules are the lock.

## Data and privacy
- Migration `20261105000000_admin_access.sql`.
- `user_roles`: one row per admin. Each person reads only their own row. Writes
  only through `add_admin`, `set_admin_level` and `remove_admin`.
- `admin_log`: id, time, admin, action, target, reason, details. Owners with
  the second step read it. Rows come only from admin functions. Triggers stop
  every update, delete and truncate.
- `is_admin(level)`: the check later admin rules use.
- The first owner is added once by DK in the SQL editor (see the migration).
- No health data is shown or stored here.

## Edge cases
- A half-done code app set-up is cleared before a new one starts.
- An email with no account: "No account uses this email."
- The same person added twice: "This person is already an admin."
- Deleting the last owner's account is refused by the same rule.

## Out of scope
- People, coaches, data requests and view-as pages (T-042a2 to T-042a5).
- Reading the log on a page. Owners can read it with SQL for now.
- An Edge Function for account actions (T-042a2).

## Tests
| Criterion | Test file |
|---|---|
| 1–7 | `src/db/admin.test.ts` |
| 8–12 | `src/admin/Admin.test.tsx` |
