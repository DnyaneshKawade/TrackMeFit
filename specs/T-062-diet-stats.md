# T-062: Food stats

Status: built; agreed (DK, 13 Oct 2026: "go ahead" on T-062 after T-061b)
Task: [T-062](../tasks/TASKS.md)

## Problem
People log food every day but can't see how the week went. They want to
know how often they hit their calories and protein, and what they eat most,
without adding up each day by hand.

## Acceptance criteria
1. Given food logged on past days, when the person opens Progress, then a
   "Food stats" section shows the last 7 days: average calories, protein,
   carbs and fat per logged day, each next to the target.
2. Given the section, when the person picks "30 days", then the same stats
   show for the last 30 days.
3. Given targets, then the section says how many logged days were on
   target. A day is on target when its calories are within 10% of that
   day's target.
4. Given targets, then the section shows the protein streak: days in a row,
   up to today, that reached at least 90% of the protein target.
5. Then a chart shows calories for each day, with the target as a line,
   and the five foods logged most often in the range.
6. Given no food logged in the range, then the section says "Log food for a
   few days to see your stats." Given no targets, it shows the averages
   only, with "Set your daily targets to see days on target."

## Rules and reasons
- Today is not over, so it is left out of averages and days on target. It
  shows in the chart, and counts for the streak once its protein is met.
- Days with nothing logged are left out of averages ("not logged"), so a
  missed day doesn't look like a day of fasting.
- Each day is compared with the target in force on that day, so a change
  of target doesn't rewrite the past.
- Quick adds count for calories but not for "most logged", as they have no
  food name we can trust.
- The reason under the count says what on target means: "On target means
  calories within 10% of your target."

## Data and privacy
- No new tables. One query reads `food_logs` for the range, using the
  existing `food_logs_user_day (user_id, logged_on)` index; one reads the
  person's `diet_targets`. No query inside a loop.
- Row-level security unchanged: the person, or their active coach.
- Nothing new is stored.

## Edge cases
- Offline: the stats use the days kept on the phone and say nothing more.
  If nothing is kept, "Couldn't load your food stats." shows.
- Many entries a day: at most 31 days are read, so the list stays small.

## Out of scope
- Stats for single meals, fibre or micronutrients.
- Comparing weeks or months with each other.
- Coach screens.

## Tests
| Criterion | Test file |
|---|---|
| 1, 3, 4, 5, 6 | `src/engine/dietStats.test.ts` |
| 1, 2, 3, 4, 5, 6 | `src/progress/DietStats.test.tsx`, `src/progress/Progress.test.tsx` |
| Offline edge case | `src/log/offlineStore.test.ts` |
