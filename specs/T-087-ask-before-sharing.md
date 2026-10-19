# T-087: Ask before sharing with a coach

Status: built
Task: [T-087](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
Typing a coach's code shared everything at once. The person did not see
the coach's name or the full list first. Health answers are sensitive, so
the person should say yes knowing what is shared.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The code shows the coach's name and everything they will see. Nothing
   is shared until the person taps "Share with ...".
2. Cancel shares nothing, and the code still works later.
3. The look-up gives the coach's name only and keeps the code.
4. Joining saves the time of the yes, and nobody can change it after.

## Rules and reasons
- "Next" calls `coach_for_code`. It runs the same checks as joining
  (wrong code, coach not approved, coach full) but uses nothing up.
- "Share with Kiran" calls `join_coach`, which now saves `consented_at`.
- The list names health answers, since the coach sees signup answers
  (T-084). The person sees "Sharing since 12 Nov 2026" after.
- Codes are 10 random characters, so guessing a name from a code is not
  practical. The look-up needs a signed-in person.

## Data and privacy
- Migration `20261112000000_coach_consent.sql` adds `coach_clients.consented_at`,
  the `coach_for_code` function, a new `join_coach` and a trigger that keeps
  the time of the yes. Old links keep an empty time. DK runs it in the
  Supabase SQL editor before merging.

## Tests
- `src/coach/YourCoach.test.tsx` "ask before sharing (T-087)" (1, 2)
- `src/db/coach.test.ts` "ask before sharing (T-087)" (3, 4)
