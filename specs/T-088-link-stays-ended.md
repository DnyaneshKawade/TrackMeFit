# T-088: An ended coach link stays ended

Status: built
Task: [T-088](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The database let a client set an ended coach link back to active. That
skipped the coach's or admin's "End", the invite code and the 30-client
limit. The coach would see the client's data again without a new yes.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. A client can't set an ended link back to active. Neither can the coach.
2. Ending a link still works for the client.
3. A new code still links the same two people again.

## Rules and reasons
- A trigger refuses any change from "ended" to another status made by a
  signed-in person. The join-with-a-code function runs as the database
  owner, so it can still start the link again.
- Changing the coach or client of a link was already blocked.

## Data and privacy
- Migration `20261111000000_client_ends_only.sql` adds the trigger. No data
  changes. DK runs it in the Supabase SQL editor before merging.

## Tests
- `src/db/coach.test.ts` "client can only end a link (T-088)" (1-3)
