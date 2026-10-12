# Work log

Newest first. One entry per finished piece of work: what changed, which tests cover it, and anything left open.

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
