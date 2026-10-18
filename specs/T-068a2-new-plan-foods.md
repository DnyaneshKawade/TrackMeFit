# T-068a2: New plan foods

Status: built
Task: [T-068a2](../tasks/TASKS.md)

## Problem
The meal plan had few lean protein foods for vegetarians. DK asked for besan,
sattu, hung curd, skimmed milk, skimmed milk powder and low-fat paneer (DK,
15 and 17 Oct 2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given the plan foods, then besan, sattu, hung curd, skimmed milk, skimmed
   milk powder and low-fat paneer are there, each in a protein pick.
2. Given a person who picks the new foods, then the plan uses them.
3. Given a plan short on protein, then foods of one kind are not put in one
   meal together (milk and skimmed milk, curd and hung curd, paneer and
   low-fat paneer).
4. Given an amount, then the hint uses chilla, katori, glass or tbsp.
5. Given a packet label copied into an ingredient, then its values are used,
   marked as a label.

## Rules and reasons
- Values come from USDA, a named USDA stand-in, or a real packet label.
  A test keeps plan foods equal to the database.
- Besan: USDA chickpea flour. 30 g makes one chilla.
- Sattu: no brand label was found online. It uses USDA raw chickpeas as a
  stand-in until DK sends a pack photo (T-031).
- Hung curd: USDA low-fat Greek yogurt as a stand-in.
- Skimmed milk and skimmed milk powder: USDA records.
- Low-fat paneer: Amul High Protein Paneer label (170 kcal, 25 g protein, 4 g
  carbs, 6 g fat per 100 g), from amul.com. The pack itself is not checked yet.
- Milk powder can go with milk, so it has no kind.

## Data and privacy
- No tables change. Nothing new is stored.
- No Open Food Facts data is used.

## Edge cases
- Vegan: besan and sattu show; the dairy foods don't.
- New foods join the "other foods" pool when picks are not enough (T-068e).

## Out of scope
- Brand label for sattu. Checking the Amul pack by hand.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/engine/mealPlan.test.ts` (new plan foods (T-068a2)) |
| 1 | `src/profile/planFoods.test.ts` |
| 5 | `src/food/indian/resolve.test.ts` |
