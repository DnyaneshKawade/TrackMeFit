# T-090: Sign out on this phone, or on all devices

Status: built
Task: [T-090](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
"Sign out" used Supabase's default, which signs out every device. Signing
out on a shared tablet also signed the person out on their phone. There
was no clear way to sign out a lost phone.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. "Sign out" in the top bar signs out this phone only.
2. The Account page has "Sign out on all devices". It asks first, and
   Cancel does nothing.
3. If it fails, the page says so.

## Rules and reasons
- Supabase sign-out scopes: `local` for this device, `global` for all
  (https://supabase.com/docs/guides/auth/signout).
- Other devices stay signed in until their access token ends, up to an
  hour. Their refresh token stops working at once.

## Data and privacy
- No migration.

## Tests
- `src/App.test.tsx` "lets someone sign out from onboarding" (1)
- `src/account/Account.test.tsx` "sign out on all devices (T-090)" (2, 3)
