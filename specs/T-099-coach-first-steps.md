# T-099: First steps for a new coach

Status: built
Task: [T-099](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
A new coach saw "We're checking your details" but not the whole path. They
didn't know what came after the check, or what clients would share.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. A new coach sees three steps: fill in your details, we check you, invite
   a client. Each is marked Done, Now or Next. Saved name, phone, city and
   one certificate photo mark the first step done. Each step says what it
   means for clients.
2. An approved coach with no clients is on the invite step. The steps go
   away once they have a client.
3. Not approved and Paused coaches see no steps.

## Rules and reasons
- Steps show only while they help: Waiting, Needs more, or approved with
  no clients.
- The first step counts saved details, not text still being typed.
- The invite step names what the coach will see, matching the list the
  client sees before saying yes (T-087).

## Data and privacy
- No migration. The steps read details and clients the screens already load.

## Tests
- `src/coach/CoachStatus.test.tsx` "first steps for a new coach (T-099)" (1, 2, 3)
