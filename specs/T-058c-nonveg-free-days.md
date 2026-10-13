# T-058c: Non-veg-free days in the plan and the log

Status: built (DK, 13 Oct 2026: "proceed")
Task: [T-058c](../tasks/TASKS.md)
Builds on: [T-057 diet rules](T-057-diet-rules.md), [T-058 meal plan](T-058-meal-plan.md) (criterion 9)

## Problem
People who eat non-veg often skip it on certain weekdays (Tuesday, Thursday,
Saturday) or through a season (Shravan, Navratri, Chaturmas). T-057 records
those days. The saved meal plan and the food log don't use them yet, so the
plan still says "chicken" on a Tuesday.

## Acceptance criteria
1. Given a person's non-veg-free weekdays, when a date falls on one, then the
   app knows the reason in words ("Tuesday").
2. Given a non-veg-free season, when a date falls inside that season's dates
   for the year, then the app knows the reason ("Shravan"); outside it, or in
   a year we have no dates for, the season does not apply.
3. Given a non-veg-free day, then meat, fish and eggs are left out that day,
   on top of what the diet, rules and allergies already leave out.
4. Given a saved meal plan, then the Food tab shows "Your meal plan" for the
   day, with each meal's foods in grams.
5. Given a non-veg-free day, then that day's plan swaps each meat, fish or egg
   item for a veg protein food of about the same protein (the person's own
   veg picks first, then paneer, dal, or soya for vegans), and says why ("Today
   is Tuesday, your non-veg-free day, so chicken is swapped for paneer").
6. Given a non-veg-free day, then the Food tab says so at the top, and if the
   person opens meat, fish or egg to log it, the app gently mentions the day
   and suggests a veg food. Logging still works: the person decides.
7. Given a non-veg-free day, the person can tap "I’m eating non-veg today" to
   switch the day back to their usual plan, for that date only.

## Season dates
Festival dates follow the moon and differ by region by about a day, so the
dates are estimates, and criterion 7 covers any day we get wrong. Dates for
2026 and 2027 (inclusive), checked 13 Oct 2026:

| Season | 2026 | 2027 | Source |
|---|---|---|---|
| Shravan (Amanta, as in Maharashtra, Gujarat and the south) | 13 Aug to 11 Sep | 2 Aug to 31 Aug | panchangbodh.com, drikpanchang.com |
| Navratri (Chaitra and Sharad) | 19 to 27 Mar; 11 to 19 Oct | 7 to 15 Apr; 30 Sep to 8 Oct | smartpuja.com, Business Today (Drik Panchang), dekhopanchang.com, ishvaram.com |
| Chaturmas (Devshayani to Prabodhini Ekadashi) | 25 Jul to 20 Nov | 14 Jul to 10 Nov | panchangbodh.com, dekhopanchang.com |
| Ramadan (India, by moon sighting) | 19 Feb to 20 Mar | 9 Feb to 10 Mar | wego.com |
| Lent (Ash Wednesday to Holy Saturday) | 18 Feb to 4 Apr | 10 Feb to 27 Mar | Western church calendar |

- Shravan uses the Amanta month by default (DK is in Maharashtra). North
  India's Purnimanta Shravan starts about 15 days earlier (30 Jul to 28 Aug
  2026); a setting for that is out of scope here.
- Dates for 2028 onward are added in a yearly update; until then seasons do
  not apply in that year (criterion 2).

## Rules and reasons
- `src/profile/nonvegDays.ts` is pure: `nonvegOffReason(date, rules)` returns
  the reason or null; `dayExcluded(base, date, rules)` adds meat, fish and egg.
- `vegDayPlan` in `src/engine/mealPlan.ts` swaps items with `swapItem`, so the
  limits and the protein match from T-058b still hold.
- Nothing is blocked: the log only informs (CLAUDE.md: suggestions, the person
  decides).
- Veg protein foods bring more calories than chicken or fish, so after the
  swap cereals are trimmed a step at a time (largest first) to keep calories
  within about 2% of the usual day; protein can then be a few grams lower,
  and the plan says "Cereals are a little less today".
- To keep the first load small, the plan card and the onboarding screens load
  only when needed (main bundle 132.9 KB of 140 KB).

## Data and privacy
- No migration. The day's "I’m eating non-veg today" choice is kept on the
  device only (browser storage, per date); it is a convenience, not a record.
- The meal plan is read from `meal_plans` (T-058b), same RLS.

## Edge cases
- No saved plan: no plan card; the day note still shows.
- No veg protein food allowed (for example a vegan with a soy allergy): the
  item is dropped with a note to add dal or another protein food.
- Veg, vegan and Jain diets: no non-veg-free days (T-057 clears them).
- A date in two seasons (Navratri inside Chaturmas): the first reason found.

## Out of scope
- Purnimanta or other regional calendars, Ekadashi and other single fasting
  days (the fasting answers from onboarding), weekly menus.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/profile/nonvegDays.test.ts` |
| 5 | `src/engine/mealPlan.test.ts` |
| 4, 5, 6, 7 | `src/log/FoodLog.test.tsx` (non-veg-free days) |
