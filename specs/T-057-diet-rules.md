# T-057: Diet rules and a typical day that matches the diet

Status: built
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
   (Changed in T-058c: the season question is removed; people make any day
   a veg day themselves on the Food tab.)
3. Given the person is vegetarian, vegan or Jain, then the non-veg-free days
   question is hidden and any saved non-veg-free picks are cleared.
4. Given a vegetarian or Jain, when they reach the typical day, then egg and
   meat items are not shown.
5. Given an eggetarian, then meat, fish and chicken items are not shown, eggs
   are.
6. Given a vegan, then milk, curd, paneer, ghee and milk sweets are not shown
   (and egg and meat).
7. Given a Jain or "no onion or garlic", then "Dal" and "Sabzi" become "Dal
   (no onion or garlic)" and "Sabzi (no roots, onion or garlic)", using our
   Jain recipes for the numbers. General rows such as "Fried snacks" stay,
   since a Jain version exists for each.
8. Given any diet, when the person searches for "+ Add another food" on the
   typical day, then every food shows. (Changed 15 Oct 2026, DK: "let them
   see all of it". People sometimes eat outside their diet, and a hidden
   food looks like a missing one. The everyday rows above still follow the
   diet, and so do plans the app makes.)
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
- Every suggested target carries the note: "Please note: these numbers are
  only suggestions, based on nutrition research. They are not medical
  advice. You decide whether to follow them. If you have a health problem,
  are pregnant, or take regular medicine, talk to your doctor first."
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
- Packaged products and raw foods have no recipe, so their tags are guessed
  from the name (marked `tagsGuessed`). A biscuit with milk not in its name
  can still show for a vegan; reading the ingredient list is a later task.
- Allergies to milk, egg and seafood also hide those foods.
- Typical-day rows are tagged by hand for the general food ("Dal" means any
  dal), so ghee in the dal recipe does not hide dal from vegans.

## Out of scope
- Meal plan (T-058), filtering the main food log search (T-041).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3 | `src/profile/Onboarding.test.tsx` |
| 4, 5, 6, 7 | `src/profile/dietRules.test.ts` |
| Tags | `src/profile/dietRules.test.ts` (food tags) |
| 8, 9, 10 | `src/profile/dietRules.test.ts`, `src/profile/Onboarding.test.tsx` |
