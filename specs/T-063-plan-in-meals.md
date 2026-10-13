# T-063: Meal plan inside the meals

Status: agreed (DK, 13 Oct 2026: "why are showing your meal plan sperately above the breakfast,lunch,snack,dinner, why not just populate these?")
Task: [T-063](../tasks/TASKS.md)

## Problem
The meal plan sits in its own box above Breakfast, Lunch, Snacks and Dinner,
so each food shows twice once it is ticked: in the plan box and in the meal.
People look for their breakfast under Breakfast. The plan should sit inside
each meal, while the log still counts only what was eaten (T-060).

## Acceptance criteria
1. Given a saved meal plan, when the Food tab shows a day, then each plan
   item shows under its meal (Snack under Snacks), faded, with a tick box,
   and there is no separate plan box.
2. Given a planned item, when the person ticks it, then it is logged and
   shows in the same place as a normal entry, still ticked; the meal and day
   totals count it. Planned items that are not ticked are never counted.
3. Given a ticked item, when the person unticks it, then its entry is
   removed and the item shows faded again.
4. Given a meal with planned items, then its header has an "Ate all of
   Breakfast" tick box (part-ticked when some are ticked).
5. Given a saved plan, then one line above the meals says "Your meal plan",
   about how many kcal and grams of protein it has, how many items are
   eaten, and has the "Ate the whole plan" tick box.
6. Given food added by hand, then it shows under its meal after the planned
   items, with its ✕ to remove it, as today.

## Rules and reasons
All of T-060 still holds: a tick is a shortcut for adding the planned
amount, an untick removes only the entry that tick made, and veg days tick
the veg items. The veg-day reason and the cereal note show under the plan
line.

## Data and privacy
No data changes. No migration.

## Edge cases
- No saved plan: the meals look as they do today.
- An entry from an older plan (or from the other veg-day version) is shown
  as a normal entry with ✕, not as a planned item.
- While the plan view loads, the meals show without planned items.
- A meal with no planned items (none today, but possible after editing the
  plan, T-061) has no meal tick box.

## Out of scope
- Changing the plan from the Food tab (T-061).
- Diet stats (T-062).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 6 | `src/log/TodayPlan.test.tsx` |
