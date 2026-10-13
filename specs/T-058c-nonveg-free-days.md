# T-058c: Veg days in the plan and the log

Status: built (DK, 13 Oct 2026: "proceed"; "dont customise too much, shravan
or not, people will choose as per their wish whenever they want")
Task: [T-058c](../tasks/TASKS.md)
Builds on: [T-057 diet rules](T-057-diet-rules.md), [T-058 meal plan](T-058-meal-plan.md) (criterion 9)

## Problem
People who eat non-veg often skip it on certain weekdays (Tuesday, Thursday,
Saturday) or through a season (Shravan, Navratri). T-057 records their
weekdays. The saved meal plan and the food log don't use them yet, so the
plan still says "chicken" on a Tuesday.

## Acceptance criteria
1. Given a person's non-veg-free weekdays, when a date falls on one, then it
   is a veg day, with the reason in words ("Tuesday is your non-veg-free
   day").
2. Given any day, the person can tap "Make today a veg day", and on a usual
   veg day "I’m eating non-veg today", for that date only. Seasons such as
   Shravan or Navratri are left to this choice: the app keeps no festival
   calendar (DK, 13 Oct 2026).
3. Given a veg day, then meat, fish and eggs are left out that day, on top of
   what the diet, rules and allergies already leave out.
4. Given a saved meal plan, then the Food tab shows "Your meal plan" for the
   day, with each meal's foods in grams.
5. Given a veg day, then that day's plan swaps each meat, fish or egg item for
   veg protein foods of about the same protein (the person's own veg picks
   first, then paneer, dal, soya or tofu), within limits, and says why
   ("Tuesday is your non-veg-free day, so chicken is swapped for paneer").
6. Given a veg day, then the Food tab says so at the top, and if the person
   opens meat, fish or egg to log it, the app gently mentions the day and
   suggests a veg food. Logging still works: the person decides.
7. Given the person changes the day (criterion 2), then the plan and the
   notes follow at once, and the next week's weekday is a veg day again.

## Rules and reasons
- `src/profile/nonvegDays.ts` is pure: `nonvegWeekday`, `vegDayReason(date,
  rules, choice)` and `dayExcluded`.
- `vegDayPlan` in `src/engine/mealPlan.ts` fills each swapped item's protein
  from the choices in order, each within its per-meal and per-day limit.
- Veg protein foods bring more calories than chicken or fish, so after the
  swap cereals are trimmed a step at a time (largest first) to keep calories
  within about 2% of the usual day; protein can then be a few grams lower,
  and the plan says "Cereals are a little less today".
- Nothing is blocked: the log only informs (CLAUDE.md: suggestions, the person
  decides).
- Only people who eat non-veg or eggs see the veg-day line.
- To keep the first load small, the plan card and the onboarding screens load
  only when needed (main bundle about 133 KB of 140 KB).

## Data and privacy
- No migration. The day's choice is kept on the device only (browser
  storage, per date); it is a convenience, not a record.
- The onboarding question "Seasons you skip non-veg" (T-057) is removed;
  any saved season answers are ignored.
- The meal plan is read from `meal_plans` (T-058b), same RLS.

## Edge cases
- No saved plan: no plan card; the veg-day line still shows.
- No veg protein food allowed (for example a soy and milk allergy): the item
  is dropped with a note to add dal or another protein food.
- Veg, vegan and Jain diets: no veg-day line (every day is already veg).
- Storage blocked (private window): the choice works until the page reloads.

## Out of scope
- Festival calendars, Ekadashi and other fasting days (the fasting answers
  from onboarding), weekly menus.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/profile/nonvegDays.test.ts` |
| 5 | `src/engine/mealPlan.test.ts` |
| 4, 5, 6, 7 | `src/log/FoodLog.test.tsx` (veg days) |
