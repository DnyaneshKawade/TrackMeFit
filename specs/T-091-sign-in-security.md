# T-091: Sign-in and security on the Account page

Status: built
Task: [T-091](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
People could not see which email their account uses or how they sign in.
They could not change their password without "Forgot password", or change
their email at all.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The page shows the email and how you sign in. A Google user sees no
   password or email rows.
2. Changing the password needs the old one. A wrong old password shows an
   error. The new one follows the sign-up rule and is typed twice.
3. Changing the email says to check both inboxes.

## Rules and reasons
- Supabase does not ask for the old password by default, so the app checks
  it with a sign-in first (OWASP: ask for the current password).
- Supabase's "Secure email change" sends a link to the old and the new
  address. The change counts once both are opened.
- Google users change their password with Google. Adding a password to a
  Google account came later in [T-091b](T-091b-google-password.md).

## Data and privacy
- No migration. Passwords never leave Supabase Auth.

## Tests
- `src/account/Security.test.tsx` "sign-in and security (T-091)" (1-3)
