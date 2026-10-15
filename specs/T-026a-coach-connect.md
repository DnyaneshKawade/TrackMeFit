# T-026a: Connect a coach and a client

Status: agreed (DK, 15 Oct 2026: "go by the logical sequence of task"; first part of T-026)
Task: [T-026](../tasks/TASKS.md)

## Problem
Coaches can sign up, and the database already lets an active coach read a
client's data. But no screen links a coach to a client. People need a simple
and private way to join a coach, and to stop sharing at any time.

## Acceptance criteria
1. Given a coach, when they tap "Invite a client", then they get a code
   that works once, for 7 days, with "Share on WhatsApp" and "Copy code".
2. Given a person with the code, when they enter it under "Your coach" on
   the Progress tab and tap "Join", then they are linked to that coach and
   see the coach's name.
3. Given a wrong, used or old code, then the person sees "That code didn't
   work. Ask your coach for a new one." and nothing changes.
4. Given a person who already has a coach, when they join a new coach,
   then the old link ends. A person has one coach at a time.
5. Given a linked person, when they tap "Stop sharing with your coach" and
   confirm, then the coach can no longer see their data.
6. Given a coach, then the "Clients" tab lists their clients by name, and
   "End" stops the link after a confirm.
7. Given the database, then only coaches make codes, a code is used once,
   nobody can link someone else, and a coach sees a client's data only
   while the link is active.

## Rules and reasons
- "Your coach can see your food, workouts, weight, measurements and
  photos. They can also set your targets and plans."
- A code instead of an email search, so nobody can find out who uses the
  app by guessing emails. The person joining is the one who agrees.

## Data and privacy
- Migration `20261027000000_coach_invites.sql`:
  - Table `coach_invites(code, coach_id, expires_at)`. Only the coach who
    made a code sees or deletes it. Codes are 10 random letters and digits.
  - Function `join_coach(code)` checks the code, ends any other coach link,
    makes the link active and deletes the code.
- The existing `coach_clients` rules stay: either side sees the link, the
  client or the coach can end it.

## Edge cases
- A coach can't use their own code, and coach accounts can't join a coach.
- Spaces, dashes and small letters in a typed code are ignored.
- Rejoining a coach after ending makes the old link active again.
- Offline: "Couldn't connect. Check your connection."

## Out of scope
- Client list sorted by who needs attention, check-ins, coach chat,
  templates and a client limit (later parts of T-026).
- The coach opening a client's food, training or progress screens.

## Tests
| Criterion | Test file |
|---|---|
| 1, 6 | `src/coach/Clients.test.tsx` |
| 2, 3, 5 | `src/coach/YourCoach.test.tsx` |
| 4, 7 | `src/db/coach.test.ts` |
