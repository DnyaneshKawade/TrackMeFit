# T-026i: Client limit per coach

Status: built
Task: [T-026i](../tasks/TASKS.md)

## Problem
The coach plan (T-026) asks for a limit on clients per coach. Without one, a coach could take on more people than they can look after.

## Acceptance criteria
1. Given a coach with as many active clients as their limit, when they ask for a new code, then the database refuses. An older code says the coach is full and is kept for later. Nobody can change their own limit.
2. Given the Clients tab, when it loads, then the heading shows the count against the limit, like "Your clients (12 of 30)". A full coach who taps "Invite a client" gets a plain reason.
3. Given a code from a full coach, when a person enters it, then they are told the coach has no space, and nothing changes.

## Rules and reasons
- The limit is 30 for every coach for now. The admin pages (T-042) will change it per coach.
- Someone who is already this coach's client is not counted twice.
- An old code is not deleted when it fails, so it works once the coach has room again.

## Data and privacy
- Migration `20261104000000_client_limit.sql`: `profiles.client_limit` (1 to 500, default 30), with a trigger that stops people changing it.
- `coach_has_room` counts active clients. New codes and `join_coach` both check it.

## Edge cases
- Two people joining at the same moment could both get the last place. That is rare, and the coach can end a link.

## Out of scope
- Changing the limit from the app; that comes with the admin pages.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/db/coach.test.ts` |
| 2 | `src/coach/Clients.test.tsx` |
| 3 | `src/coach/YourCoach.test.tsx` |
