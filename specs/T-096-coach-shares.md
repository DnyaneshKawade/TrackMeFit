# T-096: Choose what your coach sees

Status: built
Task: [T-096](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`, G12).

## Problem
Sharing with a coach was all or nothing. A coach saw progress photos and
health answers as soon as the person joined.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The coach sees no photos or health answers until the client turns each on.
2. Only the client changes the switches.
3. An ended link turns both off, so joining again shares nothing extra.
4. Photos and health answers the client keeps private say "Not shared".
5. Shared parts show as before.
6. Photos and health answers start off. Each switch saves at once.

## Rules and reasons
- DPDP s.6(1): consent covers only the data needed for the purpose. Apple
  Health also lets people pick each kind of data and stop at any time.
- Both switches are off at first, also for links made before this change.
  Coaches who saw photos before now see "Not shared" until the client says yes.
- The rule lives in the database. Health answers move to a new table,
  `health_answers`, so row-level security can hide them. Photos and their
  files check the photo switch.
- Only `set_coach_shares` changes the switches, and only for the client's
  own active link. Ending a link turns both off.
- The consent screen (T-087) no longer lists photos or health answers. It
  says they stay private and can be shared after.

## Data and privacy
- Migration `20261116000000_coach_shares.sql`: two columns on
  `coach_clients`, the `health_answers` table (answers copied, then removed
  from `profiles`), new photo policies, and "Download my data" gets a
  `health_answers` key.

## Tests
- `src/db/coachShares.test.ts` "choose what your coach sees (T-096)" (1-3)
- `src/coach/ClientView.test.tsx` "choose what your coach sees (T-096)" (4, 5)
- `src/coach/YourCoach.test.tsx` "choose what your coach sees (T-096)" (6)
