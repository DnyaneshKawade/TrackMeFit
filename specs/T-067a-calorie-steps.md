# T-067a: Calorie steps from the app's own burn number

Status: agreed (DK, 16 Oct 2026: "lets have our own brain, and can you specify how much kcal deficit we will be planning")
Task: [T-067a](../tasks/TASKS.md)

## Problem
Today the full calorie cut starts on day 1. A big eater can drop from
3,000 kcal to 1,730 kcal at once, which is hard to follow. People also
forget snacks in their usual day, so it can't set the start.

## Acceptance criteria
1. Given a loss pace, then week 1 is at the app's own burn number, and each
   later week is 250 kcal less, until the goal level.
2. Given a pace, then the planned cut is weight × 2.75 (Gentle), × 5.5
   (Steady) or × 8.25 (Faster) kcal a day. It is at most 25 % of the burn
   and 750 kcal. The goal level is never below 1,200 kcal (women) or
   1,500 kcal (men) without a coach, and never above the burn.
3. Given a usual day at or below the goal level, then there are no steps:
   week 1 is the goal level.
4. Given a pace of 0 or more (stay, gain), then there are no steps.
5. Given setup with a loss pace, then the plan shows each week's calories,
   marks the goal level, and offers week 1 as the targets to accept.
6. Given suggested targets the person set themselves, 7 or more days old,
   then the Food tab offers the next step. Nothing changes until they tap
   "Use it". "Not now" hides it for the day. Hand-set and coach targets
   are never stepped.
7. Given targets at the goal level, then no more steps are offered. The
   last step says it is the goal level.

## Rules and reasons
- Burn: Mifflin-St Jeor × activity (desk 1.3, on feet 1.45, physical 1.6),
  as today. The usual day is only a cross-check (Lichtman 1992).
- Steps of 250 kcal a week are coaching practice, not trial-tested.
- Caps: 25 % of the burn and 750 kcal (ADA, NICE). Floors as today.
- Reasons shown: "Week 1 is 2,430 kcal a day. That is about what you
  burn." "Then it goes down 250 kcal each week, to 1,820 kcal." "Small
  steps are easier to follow. You tap OK before each new step." "At your
  goal level, you’d lose about 0.4 kg a week."
- Example: an 85 kg desk-job man burns about 2,430 kcal. Faster gives
  2,430, 2,180, 1,930, then 1,820 kcal.

## Data and privacy
- No migration. A step is saved as a new `diet_targets` row with
  `source = 'suggested'`, starting today, like accepted setup targets.
- "Not now" is kept in this device's storage only.

## Edge cases
- No weight logged: no step is offered.
- Weight changes: the goal level is worked out again from the latest weight.
- A step offered on a past day: only today's log shows steps.
- Storage off: "Not now" hides the step until the page reloads.

## Out of scope
- Learning the real burn from logs and weight (T-067d).
- The explainer screens with the step picture (parked).
- Gain paces, which stay as they are.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4 | `src/engine/steps.test.ts` |
| 5 | `src/profile/Onboarding.test.tsx` |
| 6, 7 | `src/engine/steps.test.ts`, `src/profile/profile.test.ts`, `src/targets/TargetsFood.test.tsx` |
