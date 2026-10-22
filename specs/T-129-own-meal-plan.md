# T-129: Build, change and delete your own meal plan

Status: built
Task: [T-129](../tasks/TASKS.md)

## Problem
The app only made a suggested plan, which people could then change. Some people want to plan every food themselves. They also need a way to delete a plan.

## Acceptance criteria
1. Given targets are set, when "Build my own plan" is tapped, then four empty meals show, and an empty plan can't be saved.
2. Given foods are added to the meals, when "Save plan" is tapped, then the plan is saved and shown on the Food tab.
3. Given a saved own plan, when "Change plan" is used, then it can be changed and saved like any plan.
4. Given a saved plan, when "Delete meal plan" is tapped twice, then the plan is gone and "Make a meal plan" comes back.

## Rules and reasons
- Diet targets come first, so the live check can compare the plan with them.
- The person chooses every food, so the plan is theirs. The health check only stops automatic plans.
- Deleting removes the plan and its older versions. Foods already logged from it stay in the log.
- Only the person can delete. A coach can still change the plan, but not delete it (T-125).

## Data and privacy
- No database change. Deletes use the owner-only delete rule on `meal_plans` from T-125.

## Edge cases
- No targets: "Make a meal plan" isn't shown, as before.
- A failed delete keeps the plan and says so.

## Out of scope
- Several saved plans to switch between.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/log/ownMealPlan.test.tsx` |
