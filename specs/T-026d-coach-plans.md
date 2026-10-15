# T-026d: A coach edits a client's workout plan

Status: agreed (DK, 15 Oct 2026: "go by the logical sequence of task"; fourth part of T-026)
Task: [T-026](../tasks/TASKS.md)

## Problem
A coach can see a client's workouts but can't change what the client
trains. The coach needs to build and change the client's plans from the
client page. The client needs to know when the coach changed a plan.

## Acceptance criteria
1. Given a client's page, then the coach sees the client's plans with their
   days, and who last changed each plan and when.
2. Given "Edit" on a plan, when the coach changes it and saves, then the
   client's plan is changed and the list shows "Changed by you".
3. Given "+ New plan", when the coach saves a plan, then the client has the
   new plan.
4. Given the plan editor on a client's page, then the coach can pick the
   client's own exercises and the built-in ones, and sees their names. The
   coach can't delete the client's plan.
5. Given a plan the coach changed, then the client sees "Changed by your
   coach on 15 Oct." under the plan on the Training tab.
6. Given the database, then only the person and their active coach change
   a plan, and the plan records who changed it last. Nobody can record
   someone else as the person who made or changed it.

## Rules and reasons
- A plan shows "Changed by you", "Changed by Asha" or "Changed by your
  coach", with the date, so both sides know where a change came from.
- Starting a new training block after a review is not a change to the plan.

## Data and privacy
- Migration `20261029000000_plan_changed_by.sql`: `workout_plans` gets
  `updated_by` and `updated_at`. A trigger fills them on insert and when the
  plan is saved (its name is written), and fixes `created_by` to the signed-in
  person. Row-level security is unchanged: the person or their active coach
  (`can_see`).
- The coach reads the client's own exercises with the same rule (`can_see`).
  The coach can't add or change them.

## Edge cases
- A client with no plans: "No plan yet."
- If plans fail to load, the page says so and still shows the rest.
- When the coach leaves the client page, the coach's own exercises come back
  in search.

## Out of scope
- Plan templates shared across clients (a later part of T-026).
- Telling the client by message; check-ins and chat come later.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 4 | `src/coach/ClientView.test.tsx` |
| 5 | `src/training/Workouts.test.tsx` |
| 6 | `src/db/coach.test.ts` |
