# T-057: Diet rules and a typical day that matches the diet

Status: agreed (DK, 13 Oct 2026)
Task: [T-057](../tasks/TASKS.md)

## Problem
Many Hindu households skip non-veg on certain weekdays (often Tuesday,
Thursday or Saturday) or for a season (Shravan, Navratri, Chaturmas), and the
app cannot record that. Some people have no restrictions at all and the
current "Non-veg" label does not say so. The typical-day step also shows eggs
and chicken to vegetarians and Jains, which is confusing and lets wrong
answers in.

## What DK asked for (13 Oct 2026, in his words where possible)
- "food habits should have more options as hindu culture doesnot allow eating
  non veg in certain seasons or days in week"
- "there should be a option to select no food restrictions can eat anything"
- "when a person selects vegetarian/jain then no need to show non veg/egg
  related inputs in typical day page same for eggetarian etc."
- Weights in grams, "no portions"; amounts "preferably raw measured".

## Acceptance criteria
1. Given the food-habits step, when the person looks at "What you eat", then
   the non-veg option reads "I eat everything (veg and non-veg)".
2. Given the person eats everything or is eggetarian, when they open the
   food-habits step, then they can pick non-veg-free weekdays (Mon to Sun) and
   seasons (Shravan, Navratri, Chaturmas, Ramadan fasting days, Lent).
3. Given the person is vegetarian, vegan or Jain, then the non-veg-free days
   question is hidden and any saved non-veg-free picks are cleared.
4. Given a vegetarian or Jain, when they reach the typical day, then egg and
   meat items are not shown.
5. Given an eggetarian, then meat, fish and chicken items are not shown, eggs
   are.
6. Given a vegan, then milk, curd, paneer, ghee and milk sweets are not shown
   (and egg and meat).
7. Given a Jain or "no onion or garlic", then items whose recipe uses potato,
   onion, garlic or other root vegetables (Jain) or onion and garlic (the
   rule) are not shown, and a Jain-safe sabzi is offered instead.
8. Given any diet, when the person searches for "+ Add another food" on the
   typical day, then results follow the same rules.
9. Given a hidden item already had a count (diet changed after answering),
   then that count is dropped and not counted in the estimate.
10. Given an item on the typical day, then its weight is shown in grams next
    to the count (for example "2 roti, 80 g").

## Rules and reasons
- A food is tagged from its recipe ingredients when it has a recipe (meat,
  fish, egg, dairy, root, onion_garlic, honey); foods without a recipe are
  tagged from their name and aliases, and that tag is marked inferred.
- Diet to excluded tags:
  - everything: none.
  - eggetarian: meat, fish.
  - veg: meat, fish, egg.
  - jain: meat, fish, egg, root, onion_garlic, honey.
  - vegan: meat, fish, egg, dairy, honey.
  - rule no_onion_garlic adds onion_garlic.
- Non-veg-free days do not change the typical day; they are used later by the
  meal plan and the log ("Tuesday is a veg day for you, so we suggest paneer
  instead of chicken").

## Data and privacy
- No migration. Non-veg-free picks are stored in `profiles.food_rules` as
  codes: `nonveg_off:mon` … `nonveg_off:sun`, `nonveg_off:shravan`,
  `nonveg_off:navratri`, `nonveg_off:chaturmas`, `nonveg_off:ramadan`,
  `nonveg_off:lent`. The `diet_pref` value stays `nonveg`; only its label
  changes.
- Same RLS as today: the person and their linked coach.

## Edge cases
- A person picks every weekday: allowed; the app suggests "vegetarian"
  instead but does not force it.
- Diet changed from everything to veg: non-veg-free picks are removed.
- A custom food the person entered: no tags, so it is always shown.

## Out of scope
- Meal plan (T-058), filtering the main food log search (T-041).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/profile/Onboarding.test.tsx` |
| 4, 5, 6, 7 | `src/profile/dietRules.test.ts` |
| 8, 9, 10 | `src/profile/dietRules.test.ts`, `src/profile/Onboarding.test.tsx` |
