# T-091b: Google users add a password

Status: built
Task: [T-091b](../tasks/TASKS.md)
Follows [T-091](T-091-sign-in-security.md).

## Problem
A person who signed up with Google could only sign in with Google. If they
lose that Google account, or are on a phone without it, they are stuck.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. A Google user asks for a code, then saves a password with it. The new
   password follows the sign-up rule and is typed twice.
2. A wrong or old code shows an error, and a new code can be sent.
3. A person with a password sees no "Add a password".

## Rules and reasons
- Supabase `reauthenticate()` emails a one-time code to the account's email.
  `updateUser({ password, nonce })` saves the password only with that code.
  So someone holding a signed-in phone can't add a password on their own
  (OWASP: confirm the person before changing how they sign in).
- The email is the one Google gave, so it is already checked.
- After this, the person can sign in with Google or with email and password.
- Supabase may still list the account as Google only. The page then still
  shows "Add a password", which sets a new one. This is safe, as each time
  needs a new code.

## Data and privacy
- No migration. The password stays in Supabase Auth.
- Uses the Supabase "Reauthentication" email template. It works as it is.
  It counts towards the hourly email limit.

## Tests
- `src/account/Security.test.tsx` "Google users add a password (T-091b)" (1-3)
