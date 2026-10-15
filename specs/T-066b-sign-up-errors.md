# T-066b: Clear sign-up errors

Status: built
Task: [T-066b](../tasks/TASKS.md)

## Problem
DK saw "Something went wrong" when creating an account, as a person and as a coach.
The message hides the cause, so nobody can tell what to fix.

## Acceptance criteria
1. Given the service can't send the email or set up the account, when sign-up fails, then the person sees why in plain words.
2. Given an error the app doesn't know, when the service sends a code, then the message shows that code.

## Rules and reasons
- Email can't be sent: "We couldn’t send the email to this address. Please try Google, or try again later."
- Account set-up failed in the database: "We couldn’t set up your account on our side. Please try again later."
- Email sign-up turned off, weak password and bad email format each get their own line.
- Unknown errors show the code, such as "(unexpected_failure)". Only lower-case letters and underscores are shown.

## Data and privacy
- No tables change. The raw message is never shown, so no email address or server detail appears.

## Edge cases
- An error with no code, or an odd code, gets the old message.

## Out of scope
- Setting up an email sender (SMTP) in Supabase. DK does that in the Supabase dashboard.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/auth/SignIn.test.tsx` |
| 2 | `src/auth/SignIn.test.tsx` |
