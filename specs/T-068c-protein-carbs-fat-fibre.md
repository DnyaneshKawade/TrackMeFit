# T-068c: Protein, carbs, fat and fibre

Status: agreed (DK, 15 Oct 2026: "we can start with 1.4 gm/kg for a normal individual")
Task: [T-068c](../tasks/TASKS.md)

## Problem
Protein was 1.6 g/kg, or 2.2 g/kg for lifters losing fat. That is more
than many Indian meals can give, and above DK's start of 1.4 g/kg. Carbs
had no lowest level, so low calories could squeeze them out. There was no
fibre goal.

## Acceptance criteria
1. Given BMI under 25 (underweight too), then protein is 1.4 g per kg of
   body weight.
2. Given BMI 25 or more, then protein is 1.4 g per kg of the weight at
   BMI 25.
3. Given kidney disease, then protein is 0.8 g per kg, with a doctor note.
4. Given any calorie level, then fat is about a quarter of calories (at
   least 0.6 g/kg) and carbs fill the rest. Carbs stay at 130 g and 40 %
   of calories or more: fat goes down to 20 % first, then protein, never
   below 1.2 g per kg. The plan says when protein is lower.
5. Given any calorie level, then the fibre goal is 14 g per 1,000 kcal,
   and at least 25 g.
6. Given setup or a weekly calorie step, then the targets use these rules
   and the plan shows the reasons.

## Rules and reasons
- 1.4 g/kg: above the 1.3 g/kg point where more protein adds little
  muscle (Tagawa 2021), below the 1.6 g/kg plateau (Morton 2018).
- BMI 25 weight: body fat needs no extra protein (Weijs).
- Carbs at least 130 g (ICMR-NIN) and 40 % of calories. Fat 20 to 30 %,
  never under 0.6 g/kg (ICMR 2024). Fibre: WHO 2023, Reynolds 2019.
- Reasons shown: "Protein is 1.4 g per kg of body weight. That is enough
  to build muscle." "Protein is 1.4 g per kg of a healthy weight (72 kg)."
  "Protein is a little lower for now. Carbs stay at 150 g or more." "Eat
  about 25 g of fibre a day. Dal, vegetables and fruit help."

## Data and privacy
No migration. Fibre is shown as a goal in the plan, not saved as a target.

## Edge cases
- Very low calories at a high weight: protein stops at 1.2 g/kg, even if
  carbs can't reach 130 g. The calorie floors keep this rare.
- Kidney disease: protein is never raised to make room.

## Out of scope
- The opt-in 1.6 to 2.0 g/kg for lifters (DK agreed; needs a setup choice).
- At least 1.2 g/kg at 65 and over is already met by 1.4 g/kg.
- Checking that the picked foods can reach the protein (T-068b meal plan).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 5 | `src/engine/nutrients.test.ts` |
| 6 | `src/profile/profile.test.ts` |
