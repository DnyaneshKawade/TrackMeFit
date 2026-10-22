# T-134: Change the amount of a food, or copy it to another meal

Status: built
Task: [T-134](../tasks/TASKS.md)

## Problem
A logged food could only be removed and added again. DK (22 Oct 2026) asked to change the amount, and to copy a food to another meal, in the food log and the meal plan.

## Acceptance criteria
1. Given a logged food, when "Edit" is tapped and a new amount saved, then its calories, protein, carbs and fat change to match.
2. Given a logged food, when "Copy to Lunch" is tapped, then the same food and amount is added to lunch, and the first stays.
3. Given a quick add, when "Edit" is tapped, then there is no amount box, but it can still be copied.
4. Given a meal plan being changed, when "Copy to" picks another meal, then the same food and amount is added there.

## Rules and reasons
- A new amount is saved as a new entry in place of the old one. So it works offline with the same outbox.
- Amounts in the meal plan were already changeable in its grams box.
- A copied plan food says "You copied this from Breakfast." as its reason.

## Data and privacy
- No database change.

## Edge cases
- Food ticked from the meal plan is changed in the plan, not in the log row.
- A failed change or copy keeps the day as it was and says so.

## Out of scope
- Copying a food to another day.
