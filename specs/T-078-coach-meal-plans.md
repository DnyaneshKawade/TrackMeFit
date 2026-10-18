# T-078: Coach meal plans

Status: built
Task: [T-078](../tasks/TASKS.md)

## Problem
A coach sets a client's targets and workout plans, but not their meal
plan. DK asked for it (18 Oct 2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a coach on a client's page, they see the client's meal plan, its
   size, and who set it and when.
2. Given a coach on a client's page, they change the plan or make a new one.
   They use the same editor and target check the client uses. The client's
   food rules (veg, allergies) are used. The saved plan is the client's.
3. Given a client whose plan the coach saved, the Food tab says "Changed by
   your coach".
4. Given a coach who is not the client's active, approved coach, saving a
   plan for them is refused.

## Rules and reasons
- The client's targets set the plan's goal, as for the client.
- The health check that stops the app making a plan does not stop the coach.
  It says a doctor or coach should plan meals, and the coach is that person.
- A coach can't add new foods to the client's list. Every other food can go
  in the plan.
- The client can still change the plan. The newest save is the plan.

## Data and privacy
- No migration. `meal_plans` already lets the active coach save
  (`can_see`), and records who saved it in `created_by`.
- The coach reads the client's profile for food rules, as allowed today.

## Edge cases
- No targets yet: the editor asks to set targets first.
- No weight logged: the editor asks for today's weight.

## Out of scope
- A coach making a new exercise for a client (T-080).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/coach/ClientMealPlan.test.tsx` |
| 3 | `src/log/TodayPlan.test.tsx` |
| 4 | `src/db/coach.test.ts` |
