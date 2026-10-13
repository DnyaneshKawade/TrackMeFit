# T-061: Change the meal plan from the Food tab

Status: agreed (DK, 13 Oct 2026: "do we have a way to create a new or change the existing meal plan, post signup", then "fine for now"; T-061 added to the plan)
Task: [T-061](../tasks/TASKS.md)

## Problem
The meal plan can only be made during signup. Tastes change, targets change
(a coach sets new numbers, or Catch up switches to Steady), and a plan made
on day one stops fitting. People need to change the plan or make a new one
from the Food tab.

## Acceptance criteria
1. Given a saved plan, when the person taps "Change plan" on the plan line,
   then they see the plan meal by meal and can change an item's amount in
   grams, swap it for a similar food, remove it, or add a food to a meal.
2. Given any change, then the day's calories and protein update at once and
   a check says, in plain words, how far they are from the person's targets
   (or that they are close).
3. Given changes, when the person taps "Save plan", then the changed plan
   is saved and the Food tab shows it from today; "Cancel" keeps the old
   plan.
4. Given the editor, when the person taps "Make a new plan", then they pick
   protein foods as in signup and a new plan is built from their current
   targets, weight and usual day; "Use this plan" saves it.
5. Given no saved plan and daily targets set, then the Food tab offers
   "Make a meal plan", which opens the same new-plan screen.
6. Given a health answer that means a doctor or coach should plan meals,
   then no automatic plan is made (same rule as signup); changing an
   existing plan by hand is still allowed.

## Rules and reasons
- Changes are the person's own: the app never changes the plan by itself.
  An item changed by hand shows "You changed this."
- Amounts stay within 1 to 2,000 g. A food above its usual daily limit is
  allowed, with a note ("More than the usual 50 g dry a day").
- The protein check compares with the person's current calorie and protein
  targets; with no targets it compares with the plan's own targets.
- Ticks already made today stay in the log as normal entries (T-060 rule
  for a replaced plan).

## Data and privacy
No new tables. Saving adds a new row to `meal_plans` (the latest is used),
as signup does. Row-level security unchanged.

## Edge cases
- Removing the last item of a meal leaves the meal empty; it is dropped from
  the plan on save.
- No weight logged yet: "Make a new plan" asks for today's weight first.
- Offline: saving fails with "Couldn't save the plan. Try again." and the
  editor stays open with the changes.

## Out of scope
- Different plans for different days of the week.
- Coaches editing a client's plan (coach screens, later).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/engine/mealPlan.test.ts` (edits and the check), `src/log/PlanEditor.test.tsx` |
| 3, 4, 5, 6 | `src/log/PlanEditor.test.tsx` |
