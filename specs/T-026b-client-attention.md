# T-026b: Clients sorted by who needs attention

Status: agreed (DK, 15 Oct 2026: "go by the logical sequence of task"; second part of T-026)
Task: [T-026](../tasks/TASKS.md)

## Problem
A coach with many clients can't open each one every day. The Clients tab
should put the people who need help first, and say why in plain words.

## Acceptance criteria
1. Given a client who logs food, weighs in and trains as planned, then
   they have no flags and show "On track this week."
2. Given missing logs, then the reasons say how long: "No food logged for 4
   days.", "No weigh-in for 9 days.", "1 of 3 planned workouts done in the
   last 7 days." (one missed workout is not flagged).
3. Given at least 3 logged days last week, then calories more than 15% off
   the target, or protein under 80% of it, are flagged with the numbers.
4. Given a week of weigh-ins, then weight moving against the goal, or a loss
   faster than 1% a week, is flagged with the weekly change.
5. Given several clients, then the ones with the most serious flags come
   first, then by name.
6. Given the database, then the coach gets one row per active client in one
   request, counting last week without today. Others get nothing, and an
   ended link drops out.

## Rules and reasons
Flag weights: no food logged 3, calories off target 2, weight against goal
or too fast 2, missed workouts 2, protein low 1, no recent weigh-in 1.
Gaining faster than 0.5% a week is 1. The reasons are shown as written in
`src/engine/attention.ts`.

## Data and privacy
- Migration `20261028000000_client_summaries.sql`: function
  `client_summaries(today)` runs with the coach's own rights, so the usual
  privacy rules decide what it can count. Adds an index on
  `diet_targets (user_id, starts_on)`.
- Weigh-ins for all clients come in a second request, 3 weeks back. No
  query runs once per client.

## Edge cases
- A client with no target: no calorie or protein flags.
- A client with no planned workouts: no workout flag.
- Fewer than 3 logged days: no calorie flags, since the "no food" flag
  covers it.

## Out of scope
- Opening a client's food, training or progress screens (next part).
- Check-ins, chat, templates and a client limit.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 5 | `src/engine/attention.test.ts` |
| 5 | `src/coach/Clients.test.tsx` |
| 6 | `src/db/coach.test.ts` |
