# T-085: Choose a new password

Status: built
Task: [T-085](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
"Forgot password" sent an email link, but the link only signed the person
in. The app never asked for a new password, so the old one stayed.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. After a reset link, the app asks for a new password.
2. A weak password, or two that are not the same, is refused. Nothing is
   saved.
3. Saving sets the password, says so, then opens the app.
4. The sign-in service spots the link in the address or its sign-in event,
   and saves the password with Supabase's `updateUser`.

## Rules and reasons
- Same password rule as sign-up: 8 or more characters, letters and a number.
- "Not now" opens the app without a change. The old password stays.
- After the screen, the link's tokens are taken out of the address bar.
- The screen loads only when needed, to keep the main download small. The
  role step for new Google accounts now loads the same way, to make room.

## Data and privacy
- No data changes. Supabase keeps the password.

## Out of scope
- Changing a password from the Account page (T-091).

## Tests
- `src/auth/newPassword.test.tsx` (1-4)
