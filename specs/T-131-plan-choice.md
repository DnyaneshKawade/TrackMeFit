# T-131: Two ways to make a meal plan

Status: built
Task: [T-131](../tasks/TASKS.md)

## Problem
"Make a meal plan" went straight to the protein food questions. "Build my own plan" was a small extra button above them. DK asked for two clear choices first, with the targets on top (22 Oct 2026).

## Acceptance criteria
1. Given targets are set, when "Make a meal plan" is tapped, then two choices show: "Build my own plan" and "Suggest a plan". No protein question shows yet.
2. Given the two choices, when "Suggest a plan" is tapped, then the protein food questions show. "Back" returns to the two choices.
3. Given the two choices, when "Build my own plan" is tapped, then four empty meals show.
4. Given a saved plan, when "Make a new plan" is tapped, then the same two choices show.
5. Given targets are set, when making a plan, then calories, protein, carbs and fat targets show at the top.
6. Given a plan is being built or changed, then the top shows the plan's amount next to each target.

## Rules and reasons
- The suggested plan works as before: weight if none is logged, protein picks, then "Use this plan".
- The health check still stops only the suggested plan. "Build my own plan" stays open.

## Data and privacy
- No database change.

## Edge cases
- No weight logged: "Suggest a plan" asks for today's weight first, as before.

## Out of scope
- Other questions before a suggested plan.
