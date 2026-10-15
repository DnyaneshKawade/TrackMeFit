# T-041c: Fasting days in the food log

Status: rolled back (DK, 15 Oct 2026: "its a bit too much of customisation i believe, so better not to include it for now"). Built in PR #48, removed in the next change. Kept here for later.
Task: [T-041](../tasks/TASKS.md)

## Problem
People who fast (weekly, Ekadashi, Navratri, Ramadan) eat very little on those
days. Today that low day pulls their averages down and breaks their protein
streak, as if they missed their targets. The app can't know the dates:
Ekadashi and Ramadan move every year, so the person marks the day.

## Acceptance criteria
1. Given someone who said at signup that they fast, then the food log asks
   "Fasting today?" (or "Fasted on this day?" for past days) with "Mark as a
   fasting day". People who don't fast see it only on a day already marked.
2. Given a marked day, then it says "Fasting day. Your targets stay the same.
   This day is left out of your food averages." with "Not a fasting day" to
   undo it.
3. Given food stats on Progress, then fasting days have a dashed outline in
   the calorie chart.
4. Then fasting days are left out of the averages and days on target, and
   they neither add to nor break the protein streak. A note says so.

## Rules and reasons
- Targets never change on a fasting day: diet targets are set by the person
  or their coach. Moving calories to other days is a separate, opt-in idea
  (with the weekly averages in T-048 or T-047).

## Data and privacy
- Migration `20261024000000_fasting_days.sql` adds `fasting_days (user_id,
  fasted_on)`, one row per marked day. Only the person marks or unmarks a
  day; they and their active coach can read it (`can_see`).
- One query reads the fasting days of the day shown, and one reads 30 days
  for the stats, alongside the food entries.

## Edge cases
- Offline: marking needs a connection and says "Couldn't save the fasting
  day. Check your connection." The stats still show without fasting days.

## Out of scope
- Festival and Ekadashi calendars.
- Suggesting to spread the missed calories over the week.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/log/FoodLog.test.tsx` |
| 3, 4 | `src/engine/dietStats.test.ts`, `src/progress/DietStats.test.tsx` |
| Data | `src/db/rls.test.ts` |
