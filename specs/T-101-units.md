# T-101: kg or lb for gym weights

Status: built (units). The light or dark choice moves to T-101b, with the new look.
Task: [T-101](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
Many gyms in India have lb plates and dumbbells. People had to work out kg
in their head before logging a set.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. kg shows as saved; lb shows to the nearest 0.5 and goes back to the same kg.
2. Plates in lb use a 45 lb bar and lb plates.
3. The Account page saves kg or lb.
4. In lb, sets show and are typed in lb, and are saved in kg.
5. The unit is kg at first, the person changes it to lb, and nothing else is taken.

## Rules and reasons
- Sets stay saved in kg, so engines, coaches and old data need no change.
  Only the training screens show and take lb.
- lb shows to the nearest 0.5 lb. A typed lb weight is saved to 0.001 kg, so
  it shows back as the same lb.
- The + and − step doubles in lb: 2.5 kg is about 5 lb.
- lb plates: 45, 35, 25, 10, 5 and 2.5 lb, on a 45, 35 or 25 lb bar.
- Body weight stays in kg, as the food and progress screens use kg.
- The choice is saved with the account, so every phone shows the same unit.
- Engine suggestions still step in kg, so an lb suggestion can be an odd
  number like 137.5 lb. The plate hint then says the closest weight.

## Data and privacy
- Migration `20261117000000_weight_unit.sql`: `profiles.weight_unit`, kg or lb, kg at first.

## Tests
- `src/engine/units.test.ts` (1, 2)
- `src/account/Account.test.tsx` (3)
- `src/training/Workouts.test.tsx` (4)
- `src/db/weightUnit.test.ts` (5)
