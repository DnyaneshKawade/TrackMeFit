# T-026c: Open a client

Status: agreed (DK, 15 Oct 2026: "go by the logical sequence of task"; third part of T-026)
Task: [T-026](../tasks/TASKS.md)

## Problem
The Clients tab says who needs help, but the coach can't see more or act.
The coach needs one page per client with their week, and a way to change
their targets.

## Acceptance criteria
1. Given the Clients tab, when the coach taps a client's name, then they see
   what needs attention, daily targets, weight, food stats, workouts in the
   last 4 weeks and progress photos.
2. Given the client's photos, then the coach can only look. There is no add
   or remove.
3. Given "Change targets" (or "Set targets"), when the coach saves, then the
   new targets start today. The client sees them in the food log.
4. Given "← All clients", then the coach is back at the list.

## Rules and reasons
- Targets show who set them: "Set by you" or "Set by Asha", with the date.
- Diet targets stay manual: the coach enters them. The app suggests nothing
  here.

## Data and privacy
- No new tables. The page uses the same stores as the client, with the
  client's id. Row-level security already lets an active coach read the
  client's data and add targets, recorded with the coach as `set_by`
  (`src/db/rls.test.ts`).
- Photos are read through signed links, as for the client.

## Edge cases
- A client with no targets, weigh-ins, workouts or photos sees a plain "No
  … yet" line in each part.
- If a part fails to load, the page says so and still shows the rest.

## Out of scope
- Editing a client's workout plan from this page (plans can already be
  saved for a client by the database; the screen comes later).
- Check-ins, chat, templates and a client limit.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 4 | `src/coach/ClientView.test.tsx` |
