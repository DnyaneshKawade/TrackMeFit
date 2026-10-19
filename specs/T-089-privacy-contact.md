# T-089: Privacy page contact and rights

Status: built
Task: [T-089](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The privacy page had no email and no named person to answer. It didn't say
how to complain, how to take back consent, or what a coach sees. India's
DPDP Act and its Rules ask for all of these.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The page shows the email (trackmefit5@gmail.com) and who answers (Track
   Me Fit). It says how to complain to the Data Protection Board.
2. It says how to take back consent and what a coach sees.

## Rules and reasons
- DK picked the name and email on 19 Oct 2026.
- The coach list matches what a client sees before saying yes (T-087).
- Taking back consent uses what the app already has: stop sharing, or
  delete the account.

## Data and privacy
- No migration. The email is a public support address, not a personal one.

## Tests
- `build/privacyPage.test.ts` "privacy contact and rights (T-089)" (1, 2)
