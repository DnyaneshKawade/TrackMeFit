# T-066: Coaches sign up with Google

Status: agreed (DK, 15 Oct 2026: "we also need coaches to login with google as discussed")
Task: [T-066](../tasks/TASKS.md)

## Problem
Google sign-up always made a regular account, so coaches had to use email
and a password. Coaches want the same one-tap Google sign-in as everyone.

## Acceptance criteria
1. Given "Create account", then "Continue with Google" shows for both roles,
   with a line saying the role is picked on the next screen.
2. Given a new Google account, when the person picks "A coach" and taps
   Continue, then the account is a coach and has the Clients tab.
3. Given a new Google account, when the person picks "Tracking my own
   fitness", then the first-run questions follow. If saving fails, the
   screen says so and they can try again.
4. Given an account that already has a role, then the question never shows.
5. Given the database, then only a new Google account picks its role, only
   once, and only as user or coach. Nobody changes a role directly.

## Rules and reasons
- "You can't change this later." The role decides what the account can see,
  so it is picked once.
- Coach approval is not on yet. When the admin switch comes (T-042a3), a coach
  from Google waits for approval like any other new coach.

## Data and privacy
- Migration `20261030000000_choose_role.sql`: `profiles.role_chosen`. A
  sign-up through Google without a role starts with it false; all others
  true. Existing accounts stay true.
- Function `choose_role(picked)` sets the role once. Only signed-in people can
  call it. The `keep_role` trigger still stops direct changes to the role
  and to the flag.

## Edge cases
- A Google account made before this change stays a regular account. Moving it
  to coach needs the admin People page (T-042a2), or a new account.
- Someone who closes the app before answering sees the question next time.

## Out of scope
- Coach approval and the admin pages (T-042a).
- Changing the role of an existing account.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 4 | `src/auth/SignIn.test.tsx` |
| 5 | `src/db/rls.test.ts` |
