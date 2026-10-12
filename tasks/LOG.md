# Work log

Newest first. One entry per finished piece of work: what changed, which tests cover it, and anything left open.

## 2026-10-12: 3,336 dishes, 3,547 products, 1,461 raw foods (T-016, T-033, T-035)

- Second batch of dish files: restaurant 350, South 350, regional non-veg 325, sweets and bakery 348, thalis/diet/vrat/Jain 343, regional veg 245. Duplicates removed across files; duplicate raw mango label merged.
- 3,336 dishes in total; 2,559 compute now, 777 wait on 69 label ingredients (`labels-needed.csv` in project files).
- `data/off/india_products.csv`: 3,547 Indian packaged products from the Open Food Facts India export DK downloaded (25,389 rows; most lacked full nutrition). ODbL, kept separate; `src/food/off.ts` loads it.
- `src/food/indian/raw-foods.ts`: 1,461 USDA foods with Indian names and aliases.
- Tests: whole suite 87 passing.
- Note: during merging, a git stash briefly emptied the in-progress dish files; all files were restored and each writer confirmed nothing was lost. Don't stash while writers are working.

## 2026-10-12: 1,375 Indian dishes (T-016)

- Recipes split into category files (`src/food/indian/recipes/`): North 274, South 290, West/East/Northeast 252, snacks/street food/drinks 261, non-veg and sweets 273, plus the 25 core dishes.
- Recipes can use any USDA food directly as `usda:<fdc_id>`; 37 non-USDA ingredients wait on label values. Duplicate label ingredients merged into `extra-ingredients/shared.ts`.
- 1,115 dishes compute now; 260 wait on labels (paneer 72, jaggery 67, khoya 21, ...).
- Energy check relaxed for vegetables and fruit (USDA carbs include fibre); added a 0-900 kcal per 100 g range check and a 1,000-dish minimum. Whole suite: 79 passing.
- Review sheet for DK: project files `trackmefit-review/indian-dishes-v2.csv`.
- Open: T-031 labels, T-033 packaged products, T-034 recipe review.

## 2026-10-12: USDA values loaded (T-030)

- DK downloaded the USDA SR Legacy zip; `data/usda/sr_legacy_macros.csv` now holds all 7,793 foods (public domain).
- Fixed the atta match. 26 of 28 ingredients come from USDA; paneer and poha wait on label values.
- `src/food/indian/database.ts` builds the database: 22 of 25 dishes computed, 3 pending (paneer bhurji, palak paneer, poha).
- Tests: `src/food/indian/database.test.ts` (6) runs against the real USDA table, including sense checks (rice ~122 kcal/100 g, a roti ~100 kcal). Whole suite: 75 passing.

## 2026-10-12: Own Indian food database, stage 1 (T-016, T-029)

- Method: compute each dish from raw USDA ingredients and our own standard recipes, so the data is ours. See `docs/indian-food-database.md`.
- `src/food/recipe.ts`: recipe calculator (per 100 g of cooked dish) and `rawEquivalent` for batch cooking.
- `src/food/indian/ingredients.ts`: 28 raw ingredients with Hinglish search names. `src/food/indian/recipes.ts`: 25 everyday dishes with katori, roti and plate portions.
- `scripts/usda/extract_macros.py` and `src/food/indian/resolve.ts`: load USDA values from the free bulk files (no API key).
- Tests: 20 new tests; whole suite 69 passing.
- Open: USDA download blocked from Claude's cloud setup (T-030), paneer and poha label values (T-031), cooked weights unverified (T-032).

## 2026-10-12: Food data plan, food model, task tracking, CI (T-007, T-008, T-009)

- Added `docs/food-data.md`: every free food source, its licence and how we use it. USDA is public domain; IFCT and INDB need permission; Open Food Facts is ODbL and kept separate; FatSecret, Edamam and Nutritionix are not free for India.
- Added `src/food/types.ts` (food model, grams and portions, calorie sanity check) and `src/food/usda.ts` (USDA record mapper).
- Tests: `src/food/food.test.ts`, 8 tests. Whole suite: 49 passing.
- Added `tasks/TASKS.md`, this log, `CLAUDE.md` conventions, and a GitHub Actions workflow running type checks and tests.
- Open: USDA API key (DK), IFCT and INDB permissions.

## 2026-10-12: Project setup and engines (T-004, T-005, T-006)

- React + TypeScript + Vite project, named Track Me Fit.
- `src/engine/diet.ts`: starting calorie estimate, trend weight, weekly expenditure update, calorie and macro targets, Indian BMI bands, protein rules.
- `src/engine/training.ts`: volume landmarks, weekly set decisions, fractional volume, per-session cap, effort targets, weight progression, deloads.
- Tests: 41 passing.
