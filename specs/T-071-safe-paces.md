# T-071: Safe paces

Status: built
Task: [T-071](../tasks/TASKS.md)

## Problem
The evidence review for the new diet engine found four gaps. "Lose" was offered to underweight people. "Faster" loss was offered at any BMI. Nothing stopped targets at very low BMI. A saved pace could be faster than the body allows.
Plan: "Track Me Fit: Diet Engine Plan" (Claude Doc), section "Safety".

## Acceptance criteria
1. Given BMI under 18.5, when the goal is to lose, then no pace is offered and a plain reason shows. Given BMI under 17, then no targets are suggested for any goal, and the person is asked to see a doctor.
2. Given BMI 25 or more, then "Faster" loss is offered. Under 25, or with no known weight, it is not.
3. Given a saved pace, when the plan is built, then the loss is kept within the weekly limit: 1% of weight at BMI 25+, 0.75% at 23 to 24.9, 0.5% under 23. An underweight person gets calories to stay steady.
4. Given the goal step, when an underweight person picks "Lose fat", then the screen says why there's no pace.

## Rules and reasons
- BMI is rounded to one decimal, as the screen shows it, so the rules match what people read.
- Bigger cuts suit more body fat (ISSN 2017). Leaner people lose more muscle when going fast (Helms 2014).
- Below BMI 17, changing food needs a doctor (NICE CG32, WHO thinness grades).

## Data and privacy
- No new data. Rules in `src/profile/goal.ts`.

## Edge cases
- "Lose fat and build muscle" when underweight: calories stay steady, with a reason.
- A doctor tick that unlocks targets at BMI 16 to 16.9 is left for later.

## Out of scope
- An alert when weight falls faster than the limit; it comes with the weekly check (T-067d).

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/profile/profile.test.ts` |
| 2 | `src/profile/profile.test.ts` |
| 3 | `src/profile/profile.test.ts` |
| 4 | `src/profile/Onboarding.test.tsx` |
