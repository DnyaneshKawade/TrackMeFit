# T-068b: Clean meal plan in roti and katori

Status: built
Task: [T-068b](../tasks/TASKS.md)

## Problem
The suggested day of meals did not look like real Indian meals. It put three
or four cereals in one meal, two dals at lunch, and tiny amounts like 15 g of
rice. Some lunches had no roti or rice at all. DK asked for a plan people can
cook: roti or rice in every main meal, one dal, whole units, and no fried food
or sweets (DK, 15 and 17 Oct 2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given any plan, then breakfast, lunch and dinner each have one cereal base
   (roti, rice, oats or sooji), and lunch has at most two.
2. Given any plan, then no meal has more than one dal.
3. Given any plan, then every amount is a whole step of its food and at least
   its smallest amount (1 roti, ½ katori rice, 1 egg, 1 katori curd).
4. Given an amount, then its hint is in whole or half units, such as
   "about 2 roti", "about 1 katori cooked dal" or "about ½ glass".
5. Given a usual day, then it sets which foods are used, not how much. Fried
   snacks, sweets and drinks never carry over. Sugar is added only to a meal
   with milk, and only if the usual day had sugar.
6. Given a high calorie target where every cereal is at its limit, then the
   plan adds another cereal to a main meal and lands within 8 % of calories.
7. Given more than one protein food, then dinner uses a different one from
   lunch.
8. Given a big cereal portion, then no meal goes over 0.55 g protein per kg.
9. Given a non-veg-free day, then swapped-in foods use at least their smallest
   amount.
10. Given the meal plan screen, then it says fried snacks, sweets and cold
    drinks stay out.

11. Given picks that can't reach the protein target, then the plan adds other
    allowed protein foods, leanest first, but never whey. Each added food says
    "Added because your picks were not enough for your protein." A note names
    them (T-068e, DK 17 Oct 2026).
12. Given a non-veg-free day, then swaps use the picks first, then paneer,
    toor dal, soya and tofu, then any other allowed protein food but whey.

## Rules and reasons
- Cereals start at about 40 % of calories, split by meal (breakfast 25 %,
  lunch 40 %, dinner 35 %). They grow in whole steps to reach calories.
- Lunch takes a dal first. Dinner takes a different food, leanest first, eggs
  last. Breakfast and snack take eggs, curd, milk, whey or nuts.
- A plan is close enough within 8 % of calories and 5 g of protein. A whole
  roti is about 100 kcal, so tighter is not always possible.
- Reasons people see: "From your usual day.", "A cereal as the base of the
  meal.", "Added for protein: X g protein per 100 g.", and the ICMR lines for
  vegetables, fruit, oil and sugar.
- Atta can go up to 240 g a day (8 roti) for big calorie targets.

## Data and privacy
- No tables change. Food units live in `src/profile/planFoods.ts`.
- Nothing new is stored.

## Edge cases
- Usual day skipped: any allowed cereal and the picked protein foods are used.
- Protein can't be reached with the picks: the plan says so and names the
  food at its limit.
- Vegan or Jain: only allowed foods are used, as before.

## Out of scope
- New foods (besan, sattu, hung curd, skimmed milk, low-fat paneer): T-068a.
- Opt-in higher protein for lifters.

## Tests
| Criterion | Test file |
|---|---|
| 1–9 | `src/engine/mealPlan.test.ts` (clean meal plan (T-068b)) |
| 10 | `src/profile/Onboarding.test.tsx` |
| 11, 12 | `src/engine/mealPlan.test.ts` (tests 6 and 5 of T-058c) |
