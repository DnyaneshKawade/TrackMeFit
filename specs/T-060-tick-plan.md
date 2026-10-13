# T-060: Tick off the meal plan

Status: built (agreed by DK merging the plan, 13 Oct 2026; asked for as "adding a checkbox in front of each item and meal, and day, if ate tick not no tick")
Task: [T-060](../tasks/TASKS.md)

## Problem
The saved meal plan shows on the Food tab every day, but it is only a guide:
someone who ate exactly the plan still searches and logs each food by hand.
Most people eat much the same meals day to day, so ticking off what they ate
from the plan is the fastest way to keep the log. The log must still show
only what was eaten, so nothing is filled in ahead.

## Acceptance criteria
1. Given a saved meal plan, when the Food tab shows a day, then each plan
   item, each plan meal and the whole plan have a tick box, all unticked
   until something is logged from the plan.
2. Given an unticked item, when the person ticks it, then it is added to that
   day's log under the matching meal (Breakfast, Lunch, Snack to Snacks,
   Dinner) with the planned amount and its calories and macros, and the box
   shows ticked.
3. Given a ticked item, when the person unticks it, then the entry that tick
   made is removed from the log; entries added by hand are never removed by a
   tick.
4. Given a plan meal, when the person ticks the meal, then every unticked
   item in it is logged; unticking the meal removes the entries its items'
   ticks made. A meal shows ticked when all its items are, and part-ticked
   when some are.
5. Given the whole plan, when the person ticks "Ate the whole plan", then
   every unticked item is logged; unticking removes what the ticks made. It
   shows part-ticked when some items are.
6. Given a ticked item, when the person changes its amount in the log (as
   for any entry), then it stays ticked with the new amount and calories.
7. Given a veg day, then the ticks log the veg-day items (the swapped
   protein foods), not the meat, fish or egg ones.
8. Given no connection, then ticking and unticking work like any other log
   entry: shown at once, marked "Not synced yet", synced later (T-027).
9. Given a past or future date, then ticks work for that date the same way,
   so a missed day can be filled in later; nothing is logged for a date
   unless the person ticks it.

## Rules and reasons
- A tick is a shortcut for "Add food" with the planned amount; the log stays
  the record of what was eaten. Unticked means not eaten (or not logged yet),
  so the day's totals never include food that wasn't ticked.
- Amounts are logged the way the plan shows them (raw or dry grams, with the
  cooked hint), so the calories match the plan.
- An entry remembers the plan item it came from, so unticking removes only
  that entry and a food also added by hand is left alone.
- Ticking does not change the plan; editing the plan stays with the person
  or their coach.

## Data and privacy
- Log entries made by a tick record where they came from (plan id, meal and
  item), so the tick state can be shown after reload and on another phone.
  Migration `20261018000000_food_log_plan_item.sql`: a nullable `plan_item`
  text column on `food_logs` (at most 200 characters); row-level security
  unchanged (the person writes only their own rows). The key is plan id,
  meal, position and food, so a veg-day swap is its own item.
- Nothing new is shared with coaches beyond the log they can already read.

## Edge cases
- The plan is replaced: ticks already made stay in the log as normal
  entries; the new plan starts unticked.
- The same food appears twice in a meal: each item has its own tick.
- Ticking the meal or day while some items are already ticked logs only the
  unticked ones (no doubles).
- A refused entry (T-027) is reported by the sync note ("1 entry couldn't
  be saved"); its tick clears when the day reloads.

## Out of scope
- A weekly plan with different days (separate task).
- Plans laid out by date ahead of time.
- Ticking off workouts.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 7, 9 | `src/log/TodayPlan.test.tsx` |
| 3 | `src/log/log.test.ts` (entries keep the plan item they came from) |
| 8 | `src/log/offlineStore.test.ts` |
| Data | `src/db/rls.test.ts` (`plan_item` saved and read back) |

Criterion 8 is in `src/log/offlineStore.test.ts` as "8 (T-060)".
