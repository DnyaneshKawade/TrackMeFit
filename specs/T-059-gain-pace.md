# T-059: More pace choices for building muscle

Status: draft (DK, 13 Oct 2026: "lets add 3 more options may be, study well and plan for it and then create required tasks")
Task: [T-059](../tasks/TASKS.md)

## Problem
"Build muscle and gain weight" offers a beginner one pace, "Lean" (0.5 % of
body weight a week). An underweight person then sees a target many months away
(50 kg to 60 kg: about 40 weeks) and loses heart. Offer up to four honest
paces, recommend the right one for the person, keep them safe for health
conditions, and show a nearer first milestone.

## The paces
Percent of body weight a week; extra calories a day are about rate × weight ×
1,100 (7,700 kcal per kg over 7 days).

| Pace | Beginner, intermediate | Advanced | Extra kcal a day at 50 / 70 kg | Note |
|---|---|---|---|---|
| Lean | 0.25 % | 0.125 % | 140 / 190 | Slow and clean: most of what you gain is muscle. |
| Steady | 0.5 % | 0.25 % | 275 / 385 | A good mix of muscle and size for most people. |
| Faster | 0.75 % | 0.5 % | 410 / 575 | The scale moves sooner; more of the gain will be fat. |
| Catch up (underweight only) | 1 %, at most 0.5 kg a week | same | up to 550 | Reach a healthy weight sooner; switch to Steady once you get there. |

50 kg to 60 kg, beginner: Steady about 40 weeks, Faster about 27, Catch up
about 20.

Recommended:

| Who | Recommended | Offered |
|---|---|---|
| Underweight (BMI under 18.5) | Faster | Lean, Steady, Faster, Catch up |
| Normal BMI, beginner | Steady (today's rate) | Lean, Steady, Faster |
| Normal BMI, intermediate or advanced | Lean | Lean, Steady, Faster |
| Overweight (BMI 23 to 24.9) | Lean | Lean, Steady |
| Obese (BMI 25 and over) | Lean | Lean, with a hint to try "Lose fat and build muscle" |

## Acceptance criteria
1. Given a normal-BMI beginner choosing to build muscle, when the pace shows,
   then Lean, Steady and Faster appear and Steady is marked recommended.
2. Given a normal-BMI intermediate, then Lean (0.25 %) is recommended; given
   an advanced lifter, then the paces are 0.125, 0.25 and 0.5 % and Lean is
   recommended.
3. Given a BMI under 18.5 and age 18 or over, then Catch up appears after
   Faster and Faster is recommended.
4. Given Catch up, then the weekly gain never exceeds 0.5 kg.
5. Given a BMI of 23 to 24.9, then only Lean and Steady appear, Lean
   recommended; given 25 or over, only Lean with the "Lose fat and build
   muscle" hint.
6. Given an eating disorder, diabetes or kidney disease, then only Lean
   appears; for an eating disorder a note says "If a care team is helping you
   regain weight, follow their plan."
7. Given pregnancy or breastfeeding, then no pace is offered and a note says
   to plan weight gain with a doctor.
8. Given an age under 18, then neither Faster nor Catch up appears.
9. Given any pace, then its note says the kg a week and the extra calories a
   day for the person's weight.
10. Given a target more than 8 weeks away, then the goal date starts with a
    first milestone ("First 2 kg by 24 November"); beyond 12 weeks the total
    is said in months.
11. Given a chosen pace that is no longer offered after the weight or health
    answers change, then the recommended pace is selected instead.
12. Given any gain rate, then calorie targets cap it at 1 % a week, and a plan
    reason says how many extra calories a day the target adds.

## Rules and reasons
- Faster gain adds mostly fat, not more muscle: Garthe 2013 (elite athletes,
  bigger surplus, same lean gain, more fat) and Helms 2023 (5 % vs 15 %
  surplus, same muscle, more skinfold). The notes say this plainly instead of
  hiding faster paces.
- Novice and intermediate lifters: about 0.25 to 0.5 % a week; advanced
  slower (Iraki 2019).
- For underweight adults, 300 to 500 extra kcal a day is a sensible range
  (NHS), so Faster is the default and Catch up is capped at 0.5 kg a week.
  Weight restoration for an eating disorder needs supervision and is never
  offered as a pace.
- Health-condition rules that already apply to fat loss (gentle only,
  pregnancy) now apply to gain too.
- The rate table and the reasons live in `src/engine/diet.ts` and
  `src/profile/goal.ts`, pure. Targets stay suggestions the person accepts.

## Data and privacy
- No migration: `profiles.goal_rate` already stores the weekly fraction.

## Edge cases
- Catch up capped to the same kg a week as Faster for a heavy person: show
  only one of them.
- Target at or below today's weight: existing message.
- Missing experience: no paces, as today.

## Out of scope
- Suggesting a switch to Steady from the Progress tab when someone on Catch up
  reaches a healthy BMI (T-059c).
- Fat-loss paces.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 9, 11, 12 | `src/profile/profile.test.ts`, `src/engine/diet.test.ts` |
| 10 | `src/profile/profile.test.ts` |
| 1, 3, 6, 10, 11 | `src/profile/Onboarding.test.tsx` |

## Sources
- Iraki et al. 2019, Sports 7(7):154, bodybuilding off-season nutrition.
- Garthe et al. 2013, Int J Sport Nutr Exerc Metab, energy surplus in elite athletes.
- Helms et al. 2023, Sports Med Open 9, surplus size and hypertrophy.
- NHS, "Healthy ways to gain weight".
