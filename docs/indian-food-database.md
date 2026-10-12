# Our own Indian food database

Goal: accurate calories and macros for the food Indians actually eat, owned by Track Me Fit, free of licence problems.

## Method

We don't copy anyone's table of dishes. We compute each dish ourselves, the same way food composition tables do (the recipe calculation method):

1. **Raw ingredients** (`src/food/indian/ingredients.ts`). Each one names the USDA SR Legacy record its values come from. USDA is public domain. A few Indian staples aren't in USDA (paneer, poha); these take values from a common package label, and the label is recorded.
2. **Standard recipes** (`src/food/indian/recipes.ts`). Typical home-style amounts that we write ourselves, with the weight of the finished dish. Spices, salt and herbs are left out because they add almost no calories.
3. **Calculation** (`src/food/recipe.ts`). The ingredient totals are divided by the cooked weight to get values per 100 g of the cooked dish. Dishes then get Indian portions (katori, roti, plate).
4. **Checks.** Tests confirm that every recipe uses known ingredients, that cooked weights are between 60% and 105% of the raw weight, and that every dish has a portion and search aliases. `energyMismatch` flags values that don't add up.

Ingredient values are never typed in by hand. Recipes are ours, so the results are ours too.

## Making it accurate

- **Cooked weights are estimates** until someone cooks the dish and weighs the pot (`yieldVerified: false`). Cooking and weighing a dish once, then updating `cookedWeightG`, is the biggest accuracy gain we can get.
- **Oil is the biggest source of error** in Indian food. Recipes state the oil amount, and the app should let users change oil and ghee per dish ("less oil", "restaurant style").
- **Raw weighers** can skip dishes entirely: log the raw ingredients, then use `rawEquivalent` to split a cooked batch by weight.

## Growing it

| Stage | What | How |
|---|---|---|
| 1 (now) | 25 everyday dishes | Written in `recipes.ts` |
| 2 | 300 dishes covering North, South, East and West Indian home food, street food and sweets | Same method; add ingredients as needed |
| 3 | Indian packaged brands | Users photograph the nutrition label, we read it and review it, then publish it as a `trackMeFit` record |
| 4 | Restaurant versions | Separate entries with more oil and cream |

## Loading USDA values

USDA bulk files need no API key:

1. Download `FoodData_Central_sr_legacy_food_csv_2018-04.zip` from https://fdc.nal.usda.gov/download-datasets and unzip it.
2. Run `python3 scripts/usda/extract_macros.py <unzipped folder> data/usda/sr_legacy_macros.csv`.
3. `resolveIngredients` in `src/food/indian/resolve.ts` matches our ingredients to that table and lists any that are still missing.
