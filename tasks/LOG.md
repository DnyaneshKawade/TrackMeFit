# Work log

Newest first. One entry per finished piece of work: what changed, which tests cover it, and anything left open.

## 2026-10-13: Typical day: any food or your own entry (T-017)

- The typical-day step in onboarding was limited to 14 everyday foods. Now "+ Add another food" searches the whole food database (one usual portion, or 100 g), and "Can't find it? Enter it yourself" takes a name, calories a day and optional protein. Added foods get the same + and − counters, and the daily estimate updates as you go.
- Saved inside `current_diet` (jsonb) as `extras`, so no database change.
- Tests: `src/profile/profile.test.ts` (20), `src/profile/Onboarding.test.tsx` (9); whole suite 244 passing.

## 2026-10-13: Onboarding, suggested targets and progress (T-017, T-021, T-022)

- Researched onboarding in MacroFactor, MyFitnessPal, Noom, Cronometer, Lose It!, HealthifyMe, Fitbod, Carbon, RP and FitNotes; findings and our choices in `docs/onboarding-research.md`.
- New users see 7 short steps with a progress bar, or can skip to logging (remembered): about you with a live BMI using Indian cut-offs and an optional waist size; a health checklist whose answers change the plan (no weight-loss targets in pregnancy, gentle pace only with an eating disorder, diabetes or kidney disease, protein capped for kidney disease) with doctor notes; training (activity, days, experience, equipment); goal with a pace in % of body weight and a live goal date for an optional target weight; food habits (diet type, no onion or garlic, fasting, allergies); a typical day of eating from tap counts of everyday Indian foods, priced from our food database; and a plan with BMI, maintenance as a range, the goal date and suggested targets with every reason. Targets are saved only if the person taps "Use these targets" (stored as `suggested`); "I'll set my own" leaves them to the person or coach.
- First weigh-in and waist are saved to progress. Coaches skip onboarding. If the profile can't load, the app opens anyway.
- New Progress tab: save or update today's weight, the trend weight with its weekly change, advice against the goal (for example, losing faster than 1 % a week), a 90-day chart, recent weigh-ins with remove, and body measurements with the change since the first.
- Database: `supabase/migrations/20261013100000_onboarding.sql` adds the new profile columns; DK runs it in the SQL Editor before merging.
- Tests: `src/profile/profile.test.ts` (17), `src/profile/Onboarding.test.tsx` (8), `src/progress/progress.test.ts` (16), `src/progress/Progress.test.tsx` (4), `src/App.test.tsx` (5), `src/db/rls.test.ts` (+2); whole suite 240 passing.
- Open: progress photos and strength trends (T-022b); using the food habits in search and the food log (T-041).

## 2026-10-13: Live on Vercel (T-028)

- The app is live at https://track-me-fit-dpvu.vercel.app with the Supabase address and anon key set in Vercel. DK signed in with Google on the live site.
- Fix on the way: the Supabase address was first typed with a digit 1 instead of a lowercase l, so Google sign-in went to an address that does not exist.
- Tests: no code change; whole suite 188 passing.

## 2026-10-13: Ready to go online (T-028, T-040)

- The app can be installed on phones: icon, `manifest.webmanifest`, and a service worker (`public/sw.js`) that caches the page and built files so it opens without a connection. Supabase requests always go to the network. Registered in production builds only.
- `vercel.json`: Vite build, app paths go to the app, built files cached for a year, the service worker never cached.
- `docs/deploy.md`: DK's one-time Vercel and Supabase steps, and how to install on Android and iPhone.
- DK ran the progression migration on the live project (T-039).
- Tests: `src/pwa.test.ts` (6); whole suite 188 passing.

## 2026-10-13: Weekly progression and deloads (T-024)

- After a workout, "How did it feel?" asks per muscle trained: sore going in, how hard, anything hurt. Skippable.
- Plans show "Week 2 of 4" (or "Deload week"). "Review week" shows each muscle's sets now and next week with the training engine's reason, from the last 7 days of answers and the strength trend (best estimated one-rep max per session). Nothing changes until "Apply these changes"; sets are added to the exercise with the fewest and removed from the one with the most, within 1-10 sets per exercise and 10 per muscle per session.
- A deload is suggested after the hard weeks, when the person feels run down, or when half the muscles drop at once. In a deload week the logger shows half the sets at week-1 weights and stops suggesting increases; the new block starts the week after.
- The logger shows each week's effort target (reps short of failure) from the engine.
- New migration `20261013000000_progression.sql` (block start date, `muscle_feedback` with privacy rules). Tests now run every migration in order.
- Tests: `src/training/progression.test.ts` (10), `src/training/Review.test.tsx` (3), `src/db/rls.test.ts` (+2); whole suite 182 passing.

## 2026-10-13: Workout plans and logger (T-023, T-025)

- The app now has two tabs, Food and Training. Training shows today's workouts, "Start a workout" (a plan day or an empty workout) and your plans.
- Plan builder: name, up to 14 days, exercises from a 63-exercise library (search by name, gym slang like "rdl" or "ohp", or muscle), sets and rep range per exercise. Problems are listed in plain words before saving. Deleting a plan hides it so past workouts keep their day.
- Logger: each exercise shows the plan target, what you did last time, and a suggestion for today from the training engine's double progression with its reason (for example "Hit 10 reps on every set, so the weight goes up"). The weight and reps are filled in from the suggestion; each set saves as soon as it is logged, with optional reps in reserve.
- Saved to the workout tables through `src/training/supabaseStore.ts`.
- Tests: `src/training/training.test.ts` (12), `src/training/Workouts.test.tsx` (5); whole suite 167 passing.
- Open: weekly set changes per muscle from feedback and deloads (T-024).

## 2026-10-13: Daily targets (T-020)

- The food log shows what is left for the day (calories, protein, carbs, fat), or "over" in red, under the day totals. With no targets yet it shows "Set your daily targets".
- The targets form takes calories and the three macros, checks the allowed ranges, can fill carbs from the calories left, and notes when the macros add up to more than 5% away from the calories (saving is still allowed).
- New targets start today and earlier days keep theirs; targets set by a coach say so. Saved to `diet_targets` (`src/targets/stores.ts`). Engine suggestions stay optional (T-021).
- Tests: `src/targets/targets.test.ts` (8), `src/targets/TargetsFood.test.tsx` (4); whole suite passing.

## 2026-10-13: Live on Supabase (T-037)

- DK created the Supabase project (Mumbai) and ran the migration. All 13 tables respond, and a test sign-up (`+test` address) created its profile through the signup trigger.
- Email and Google sign-in are switched on; the Site URL is `http://localhost:5173` until the Vercel deploy (T-028).
- The Project URL and anon key go in `.env.local` (never committed). Still to try: DK signs in with Google once in the app.

## 2026-10-12: Food log (T-018)

- After sign-in the app opens on today's food log: Breakfast, Lunch, Snacks and Dinner with calories per meal and day totals for calories, protein, carbs and fat. Arrows move to earlier days (never the future).
- "+ Add food" searches 7,567 foods (2,559 dishes, 1,461 raw foods, 3,547 packaged products) by name, Hinglish or regional alias, or brand; whole-word matches rank first, home dishes before products (`src/food/catalogue.ts`, `src/food/search.ts`).
- Amounts in portions (1 katori, 1 roti, ...) or grams, with a raw / cooked / as-sold hint and a live macro preview. Entries keep a snapshot of name and macros (`src/log/types.ts`); saved to `food_logs` through `src/log/supabaseStore.ts`.
- Tests: `src/log/log.test.ts` (7), `src/log/FoodLog.test.tsx` (7), `src/food/search.test.ts` (7); whole suite passing.
- Open: the food list is a 535 KB (gzip) download on first search (T-038); quick add, barcode and batch cooking are T-018b. Paneer and jaggery dishes still wait on labels (T-031).

## 2026-10-12: Database and sign-in (T-013, T-014)

- `supabase/migrations/20261012000000_init.sql`: profiles (user or coach, onboarding history), coach links, custom foods, food logs, diet targets, weigh-ins, measurements, custom exercises, workout plans, sessions and sets. Row-level security on every table.
- Privacy tests run the real migration in PGlite (Postgres in WebAssembly) with a stand-in auth schema: `src/db/rls.test.ts`, 17 tests, checked by weakening a rule and seeing tests fail.
- Sign-in: `src/auth/` (email + password, Google for regular users, password reset, user or coach on sign-up), behind an `AuthService` interface; `src/auth/SignIn.test.tsx`, 13 tests.
- `docs/supabase-setup.md`: the one-time steps for DK. Open: T-037 go live.

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
