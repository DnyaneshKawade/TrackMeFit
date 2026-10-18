# T-079: Open button for each client

Status: built
Task: [T-079](../tasks/TASKS.md)

## Problem
On the Clients tab, a coach opens a client by tapping their name. DK did
not see that the name was a button, so it looked like a coach can't set
targets or plans.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a coach with clients, each client has a clear "Open" button. It
   opens the client page with targets, plans and the rest.
2. Given a coach with clients, a short line says what Open is for.

## Rules and reasons
- The name still opens the client too, for those who tap it.

## Data and privacy
- No data changes.

## Edge cases
- Without the client pages (no stores), there is no Open button.

## Out of scope
- A coach meal plan editor (T-078).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/coach/ClientView.test.tsx` |
