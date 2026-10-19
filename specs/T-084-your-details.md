# T-084: Your details page and About this client

Status: built
Task: [T-084](../tasks/TASKS.md)
Asked by DK on 19 Oct 2026: users and coaches could not see the sign-up
answers, and new suggestions felt like a one-time step.

## Problem
"Your details" opened all 7 sign-up steps, so people could not just look at
their answers. New targets and meals were only at the end of the steps. A
coach could not see a client's answers, like health, diet or allergies.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Every sign-up step shows its answers in plain words.
2. Skipped answers read "Not given", and empty lists read "None".
3. The coach sees the client's sign-up answers, read only. A client who
   skipped the questions shows a note.
4. The details page shows each part with a Change button. "Suggest targets
   and meals" opens the plan step.
5. Change opens that step with the answers filled in. Save or Cancel goes
   back to the details page (the T-070 tests, updated).

## Rules and reasons
- The page shows: about you (with the latest weight), health check,
  training, goal, food habits and usual day.
- New suggestions change nothing until the person taps "Use these targets".
- The coach card is closed at first, because health answers are private.
  Row-level security already lets a coach read a client's profile.
- Only the person can change their answers.

## Data and privacy
- No data changes. The coach already had read access to client profiles.

## Out of scope
- Settings such as units, reminders and account security (see the user
  access study and tasks T-085 and later).

## Tests
- `src/profile/summary.test.ts` (1, 2)
- `src/coach/ClientView.test.tsx` "about this client (T-084)" (3)
- `src/App.test.tsx` "your details (T-070)" (4 new, 1-3 updated for 5)
