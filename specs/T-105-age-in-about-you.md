# T-105: Ask the age in About you, not in a step before it

Status: built
Task: [T-105](../tasks/TASKS.md)

## Problem
New people saw a bare "One question first" page asking for their date of
birth. Then "About you" asked it again. DK asked to use "About you" only.

## Acceptance criteria
1. Given a new person (not a coach), when they sign in, then setup opens at "About you" with no separate age page.
2. Given "About you" is filled in, when they tap Next, then the birth date is saved at once. A teen then waits for a parent, as in T-086.
3. Given "Skip setup", when no birth date is given yet, then the app asks for it first. With it, the skip saves the birth date too.
4. Given a coach, or someone who finished setup without a birth date, then the age page still shows once.

## Rules and reasons
- The age rule from T-086 is unchanged: under 13 can't go on, and 13 to 17 need a parent's yes.
- Coaches never see setup, so they keep the short age page.

## Data and privacy
No database change. The birth date is saved to `profiles.birth_date` as before.

## Out of scope
A new look for the age page that coaches see.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/App.test.tsx` "first run" |
| 2 | `src/profile/Onboarding.test.tsx`, `src/App.test.tsx` "one age rule (T-086)" 5 |
| 3 | `src/profile/Onboarding.test.tsx`, `src/App.test.tsx` "remembers a skip" |
| 4 | `src/App.test.tsx` "one age rule (T-086)" 1 |
