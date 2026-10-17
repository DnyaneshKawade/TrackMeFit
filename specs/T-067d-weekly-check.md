# T-067d: Weekly check

Status: built
Task: [T-067d](../tasks/TASKS.md)

## Problem
The weekly calorie steps (T-067a) went down 250 kcal each week, whatever the
scale said. If someone already loses at their pace, cutting more is not
needed. The burn number is also only a first guess from a formula. After a
few weeks, real weight change and food logs tell us more (DK, 16 and 17 Oct
2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given fewer than 7 days on a step, then no check is due.
2. Given no recent weigh-ins, then the check steps down 250 kcal, to the goal
   level at most, as before. At the goal level there is nothing to offer.
3. Given the average weight over the last 14 days falls at the chosen pace or
   faster, then the check holds: "You are losing about X kg a week. That is
   your pace, so stay at Y kcal for now." Only weigh-ins in the last 3 days
   count as recent.
4. Given 21 days of weigh-ins and food logged on at least 14 of those days,
   then the check learns the burn: food eaten minus the energy in the weight
   change. The burn moves halfway there, and 500 kcal at most. The goal level
   is worked out again with the same caps and floors. The step message names
   the learned burn.
5. Given fewer than 14 days of food logged, then the goal level stays as
   planned.
6. Given a hold on the Food tab, then the card has only "OK". OK hides it for
   7 days and changes nothing.

## Rules and reasons
- Hand-set and coach targets are never checked (as in T-067a).
- Nothing changes without a tap. A step needs "Use it"; a hold needs "OK".
- The pace uses the trend weight, so one heavy or light morning doesn't decide.
- Fewer than 4 food days a week does not block a step. Many people won't
  log every day; the steps still follow the plan for them.

## Data and privacy
- No tables change. One range query reads the last 21 days of food logs.
- Nothing new is stored. "OK" and "Not now" stay on the phone only.

## Edge cases
- Weigh-ins stopped weeks ago: no pace, so the step goes as planned.
- Learned burn higher than the formula: the goal may be at or above today's
  level, so nothing is offered.
- Gaining weight while on the steps: the learned burn goes down, so the goal
  goes down, within the floors.

## Out of scope
- Offering more calories when loss is too fast. Diet breaks. Gain plans.

## Tests
| Criterion | Test file |
|---|---|
| 1–5 | `src/engine/steps.test.ts` (weekly check (T-067d)) |
| 3 | `src/profile/profile.test.ts` |
| 6 | `src/targets/TargetsFood.test.tsx` |
