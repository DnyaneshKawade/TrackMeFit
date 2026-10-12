# Work log

Newest first. One entry per finished piece of work: what changed, which tests cover it, and anything left open.

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
