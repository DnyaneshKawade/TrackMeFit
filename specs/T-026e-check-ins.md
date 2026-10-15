# T-026e: Weekly check-ins and side-by-side photos

Status: agreed (DK, 15 Oct 2026: "continue with the logical sequence of tasks"; fifth part of T-026)
Task: [T-026](../tasks/TASKS.md)

## Problem
Coaches run their clients on a weekly rhythm. They need a short report from
each client every week, a way to answer it, and a way to see body changes
in photos side by side.

## Acceptance criteria
1. Given a person with a coach, then Progress shows "Weekly check-in": five
   scores from 1 to 5 (energy, sleep, mood, sticking to the food plan,
   training) and two notes. Sending saves it for this week (Monday to Sunday).
2. Given a sent check-in, then the person can change it until the coach
   replies. After that the reply shows and the answers stay as they were.
3. Given a person without a coach, then there is no check-in.
4. Given a client's page, then the coach sees their check-ins, newest first,
   each with that week's average weight and the change from the week before.
   The coach replies once to each.
5. Given progress photos, when someone taps "Compare two dates", then the
   oldest and newest photo of a pose show side by side. Either date and the
   pose can change. Coaches can compare too.
6. Given the database, then only the person writes their check-in, one per
   week, and only their active coach replies. Nobody else reads it.

## Rules and reasons
- "1 is poor, 5 is great." The same scale for every question, so it is quick.
- A check-in is for the coach. Someone without a coach has nobody to read it.
- Weight in a check-in is the week's average, not one weigh-in, because daily
  weight goes up and down with water and food.

## Data and privacy
- Migration `20261031000000_check_ins.sql`: table `check_ins`, one row per
  person and week. Read: the person and their active coach (`can_see`). The
  person writes only the answer columns; the reply goes through
  `reply_check_in`, which checks `is_coach_of` and records who replied and
  when.
- Photos are compared from the links already loaded. Nothing new is stored.

## Edge cases
- No weigh-ins that week, or the week before: the line says so.
- Fewer than two dates for a pose: "Two front photos on different days are
  needed to compare."
- A reply can't be empty.

## Out of scope
- Reminders to send a check-in, and a check-in flag on the Clients list.
- Custom questions per coach.
- Chat (the next part of T-026).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 3 | `src/coach/YourCoach.test.tsx` |
| 4 | `src/coach/ClientView.test.tsx`, `src/coach/checkIns.test.ts` |
| 5 | `src/progress/Photos.test.tsx` |
| 6 | `src/db/coach.test.ts` |
