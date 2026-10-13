# Tasks

The single list of work for Track Me Fit. Update it in the same change as the work.

- Status: `todo`, `doing`, `blocked`, `done`
- Every task that changes code lists its tests. A task is `done` only when its tests are written and passing (`npm test`).
- Finished work is also recorded in [LOG.md](LOG.md), newest first.

## Doing

| ID | Task | Owner | Tests | Notes |
|---|---|---|---|---|
| T-016 | Indian food database: 3,336 dishes (2,559 computed), 3,547 packaged products, 1,461 raw foods. Goal 10,000 dishes + products: ~3,100 short | Claude | `src/food/recipe.test.ts`, `src/food/indian/resolve.test.ts` | See [docs/indian-food-database.md](../docs/indian-food-database.md) |

## Blocked

| ID | Task | Waiting on |
|---|---|---|
| T-010 | Import IFCT 2017 Indian foods | Permission from ICMR-NIN |
| T-011 | Import Indian Nutrient Databank recipes | Licence answer from the INDB authors |
| T-012 | USDA search through our server | USDA API key from data.gov (DK) |
| T-031 | Label values for 69 non-USDA ingredients (jaggery 198 dishes, paneer 192, khoya 50, ...); unblocks 777 dishes | Packet label photos (DK) |
| T-036 | Label-photo product adding (scan a pack, reviewed before public) to grow products past 10,000 total | Part of T-018/T-019 |
| T-034 | Review leafy-green and juice recipes: some got extra oil or sugar to pass an energy check that was too strict (now relaxed) | Review pass |
| T-032 | Verify cooked weights | Someone cooks each dish and weighs the pot |

## To do

| ID | Task | Tests planned |
|---|---|---|
| T-015 | USDA bulk importer (Foundation + SR Legacy) into our foods table | Mapper tests (started in T-007), import count check |
| T-018c | Food logging extras: barcode scan (free for everyone, Open Food Facts kept separate under the ODbL), batch-cooked weighing | Component tests for each |
| T-041 | Use onboarding answers: filter food search by diet type, food rules and allergies; fasting days as flexible days; event date for goals; starter workouts by equipment | Search filter tests; plan tests |
| T-022b | Progress extras: progress photos (private storage); strength trends moved to T-044 | Photo upload privacy tests |
| T-026 | Coach dashboard: clients sorted by who needs attention with a plain reason per flag, coach-set targets with a tolerance band, weekly averages, check-in forms with weight trend and side-by-side photos, plan editing, chat with easy WhatsApp sharing, program templates clients can join midway, a client limit per coach. No paid add-ons ([study](https://claude.ai/code/artifact/4637175c-d094-4c40-80be-e4826de7c0b3)) | Permission tests; flag rule tests |
| T-042a | Admin phase 1, safe access: admin role in its own table with a required second factor, append-only audit log, Edge Function for blocking and deleting accounts, People page, coach approval, data export and delete ([plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a)) | Non-admins and admins without a second factor refused; every admin action logged; log cannot be edited |
| T-042b | Admin phase 2, food and content (after T-038): food editor, review queue for user-submitted foods, wrong-food reports, exercise library | Approved foods public with reviewer recorded; rejected stay private |
| T-042c | Admin phase 3, running the app: health numbers from the database, Sentry with personal data scrubbed, feature switches, banners, grievance queue with a 90-day clock | Numbers match a seeded database; no health field reaches Sentry |
| T-043b | Workout logger, part 2 ([spec](../specs/T-043-workout-logger.md)): supersets, favourite exercises, custom exercises | Logger component tests; custom exercise RLS tests |
| T-044 | Records and strength graphs: personal records, rep maxes, estimated 1RM with a rep cap, graphs per exercise, calendar, plate calculator with Indian gym plates | Record and 1RM tests; plate calculator tests |
| T-045 | Export and import: CSV and JSON for food, workouts and body data; import from Strong, Hevy and FitNotes | Round-trip export/import tests; sample files from each app |
| T-046 | Training engine extras: block weeks counted by sessions done, illness advice (restart, deload or continue), learned MEV and MRV per person, fresh exercises at a new block, optional "felt the muscle" tie-breaker | Engine tests, each with its reason |
| T-047 | Diet suggestion extras, all opt-in: "don't raise calories during a cut", weekly target split across training and rest days, stall options (ease the goal, maintenance break, end the diet) | Engine tests, each with its reason |
| T-048 | Copy a whole meal or day; weekly averages in the log | Log tests; component tests |
| T-049 | Food source and checked badge in search and on the amount screen; merge duplicate entries | Search and component tests |
| T-052 | Content security policy header, after listing every place Supabase and Google sign-in load from | Header test; manual sign-in check on a preview |
| T-053 | Separate Supabase project for previews, and migrations run by the Supabase CLI in CI instead of by hand | CI migration step; RLS tests still pass |
| T-054 | End-to-end tests in a real browser (Playwright) against the preview link: sign in, log food, log a set | E2E suite in CI |
| T-055 | Automated accessibility checks (lint rules and axe in component tests) | Lint in CI; axe assertions |
| T-056 | Versions and a changelog built from `tasks/LOG.md` | Release script test |

## Done

| ID | Task | Tests |
|---|---|---|
| T-061 | Change the meal plan from the Food tab ([spec](../specs/T-061-change-plan.md)): "Change plan" on the plan line opens an editor (amount in grams, swap, remove, add a food per meal) with a live check against the targets; "Save plan" saves a new version, "Cancel" keeps the old; "Make a new plan" (and "Make a meal plan" when there is none) builds one from protein picks, current targets, latest weight and usual day; health answers still stop automatic plans | `src/engine/mealPlan.test.ts` (4), `src/log/PlanEditor.test.tsx` (8) |
| T-061b | Full food search in the plan editor and the usual day: "+ Add a food" in "Change plan" and "+ Add another food" at signup open the same Add food page as the meals (search all foods, amounts, new food), with the diet's foods hidden; searched non-veg foods are swapped on veg days | `src/engine/mealPlan.test.ts` (1), `src/log/PlanEditor.test.tsx` (9), `src/profile/Onboarding.test.tsx` (1 new, 1 updated) |
| T-062 | Food stats on Progress ([spec](../specs/T-062-diet-stats.md)): last 7 or 30 days of average calories, protein, carbs and fat per logged day against the targets, days on target (calories within 10%), protein streak (90% of target), a calorie chart with the target line, the five most-logged foods; one range query on the existing index; works offline from the days kept on the phone | `src/engine/dietStats.test.ts` (6), `src/progress/DietStats.test.tsx` (4), `src/progress/Progress.test.tsx` (1), `src/log/offlineStore.test.ts` (1) |
| T-063 | Meal plan inside the meals ([spec](../specs/T-063-plan-in-meals.md)): planned items show faded under Breakfast, Lunch, Snacks and Dinner with a tick box; a tick logs them in place as normal entries; each meal header has "Ate all of …"; one plan line above the meals with the size, "N of M eaten" and "Ate the whole plan"; totals count only ticked food | `src/log/TodayPlan.test.tsx` (6 new, 8 updated), `src/log/FoodLog.test.tsx` (3 updated) |
| T-064 | Simple words across the app ([spec](../specs/T-064-simple-words.md), [rules](../docs/words.md)): everyday words instead of gym and diet terms (average weight, light week, reps left, extra calories, waiting for internet), no idioms, sentences of 20 words or fewer, checked by a test on every change | `src/words.test.ts` (3) |
| T-001 | Research: market, competitors, RP Strength, FitNotes | n/a (docs) |
| T-043a | Workout logger, part 1 ([spec](../specs/T-043-workout-logger.md)): weight and reps filled in from last time (one-tap sets), − and + steps (weight by the exercise's usual jump), rest timer that starts on each set (2:30 big lifts, 1:30 isolation, ±15 s, vibrates), set tags (warm-up, drop set, failure) left out of suggestions, set notes and workout notes, all offline-ready; migration `20261019000000_set_tags_notes.sql`. Training and Progress tabs now load on first open (main bundle 127.3 KB) | `src/training/Workouts.test.tsx` (5), `src/training/restTimer.test.ts` (2), `src/training/training.test.ts` (1), `src/training/offlineStore.test.ts` (1), `src/db/rls.test.ts` (1) |
| T-059c | Catch up to Steady ([spec](../specs/T-059-gain-pace.md)): when someone on Catch up reaches a healthy trend weight, Progress suggests Steady with the reason and the calories it lowers; "Switch to Steady" changes the pace and, if a target is set, starts a lower one today (carbs give way); "Not now" hides it for two weeks | `src/profile/profile.test.ts` (4), `src/progress/Progress.test.tsx` (2) |
| T-060 | Tick off the meal plan ([spec](../specs/T-060-tick-plan.md)): a tick box on each plan item, meal and the whole plan on the Food tab; a tick logs the planned amount, an untick removes only what the tick made (entries keep their plan item, migration `20261018000000_food_log_plan_item.sql`); part-ticked meals; change the amount of a ticked item; veg-day items on veg days; works offline and on any date; "N of M eaten" in the plan heading | `src/log/TodayPlan.test.tsx` (8), `src/log/log.test.ts` (2), `src/log/offlineStore.test.ts` (1), `src/db/rls.test.ts` (1) |
| T-027b | Offline workouts ([spec](../specs/T-027-offline-logging.md)): workouts, sets, removals and how-did-it-feel answers work without a connection, sets marked "Not synced yet" with a count; the workout goes before its sets; saved once; a refused workout drops its sets; last plans, viewed days, exercise history and review answers kept per account for the gym. Food and workouts now share one outbox (`src/sync/outbox.ts`), which also fixed a sync call being missed just as another ended | `src/training/offlineStore.test.ts` (10), `src/training/Workouts.test.tsx` (1), `src/sync/outbox.test.ts` (1), `src/db/rls.test.ts` (1) |
| T-027a | Offline food logging ([spec](../specs/T-027-offline-logging.md)): adds and removals work without a connection, shown as "Not synced yet" with a count; sent in order when the phone is back online, the app opens or returns to the front; saved once even if sent twice (id made on the phone); refused entries dropped and reported; last 14 viewed days and recent foods kept per account; viewed days cleared on sign-out | `src/log/offlineStore.test.ts` (12), `src/log/FoodLog.test.tsx` (2), `src/db/rls.test.ts` (1) |
| T-059a | Gain paces ([spec](../specs/T-059-gain-pace.md)): Lean, Steady, Faster, and Catch up for BMI under 18.5 (at most 0.5 kg a week), recommended by experience and BMI; overweight gets Lean and Steady, obese Lean with a hint; health conditions keep it to Lean; none in pregnancy; no Faster or Catch up under 18; each note gives kg a week and extra kcal a day; gain capped at 1 % a week; the plan says the extra calories | `src/profile/profile.test.ts` (9), `src/engine/diet.test.ts` (1) |
| T-059b | Goal step: recommended pace marked and picked, re-picked when weight or health answers change; first-milestone goal date and months for long goals | `src/profile/Onboarding.test.tsx` (4) |
| T-038 | Food search from the database ([spec](../specs/T-038-server-food-search.md)): tables `foods` and `off_products` (ODbL kept separate), trigram index, `search_foods` with the same ranking as the app plus typo matches, `foods_by_id` for recent foods; the app searches the server and falls back to the bundled list until the foods are imported or when offline; own foods stay on the device and show first. `npm run export-foods` writes the CSVs to import | `src/food/finder.test.ts` (5), `src/db/foodSearch.test.ts` (4), `src/food/exportFoods.test.ts` (4, incl. the empty-portions fix) |
| T-058c | Veg days ([spec](../specs/T-058c-nonveg-free-days.md)): non-veg-free weekdays plus "Make today a veg day" and "I’m eating non-veg today" per date (no festival calendar, DK); the saved meal plan on the Food tab with meat, fish and egg swapped for veg protein on veg days (cereals trimmed to keep calories); a gentle note when logging non-veg. Season question removed from onboarding. Also fixed per-meal limits for oil in the plan split, and onboarding now loads lazily | `src/profile/nonvegDays.test.ts` (3), `src/engine/mealPlan.test.ts` (2 more), `src/log/FoodLog.test.tsx` (6) |
| T-058b | Meal plan screens ([spec](../specs/T-058-meal-plan.md)): "Want us to suggest a day of meals?" on the plan step, protein picks in plain words filtered by diet, a live protein check with additions or a lower target on the person's OK, meals in raw or dry grams with a cooked view per item, swaps, the suggestion note, saved only on "Use this plan"; `meal_plans` table with RLS (migration `20261015000000_meal_plans.sql`); no plan offered when the health check says see a doctor. Screen loads lazily (6.7 KB) | `src/profile/Onboarding.test.tsx` (3), `src/engine/mealPlan.test.ts` (4 more), `src/db/rls.test.ts` (1), `src/profile/mealPlanStore.test.ts` (1) |
| T-058a | Meal plan engine ([spec](../specs/T-058-meal-plan.md)): starts from the typical day in raw grams, per-meal and per-day limits, protein gap filled from picked foods, calories fitted with the person's own cereals and fat, ICMR basics (400 g vegetables, fruit, oil, sugar), meals with at most 0.55 g/kg protein, cereal plus dal or dairy at lunch and dinner, a protein reach check with suggestions, a reason on every item. Paneer, soya and whey use USDA stand-in values until labels (T-031) | `src/engine/mealPlan.test.ts` (11), `src/profile/planFoods.test.ts` (4) |
| T-057 | Diet rules ([spec](../specs/T-057-diet-rules.md)): "I eat everything (veg and non-veg)" label, non-veg-free weekdays and seasons, typical day and its food search filtered by diet, Jain and no-onion-garlic versions of dal and sabzi, allergies respected, grams shown on the typical day, "only suggestions" note on targets | `src/profile/dietRules.test.ts` (18), `src/profile/Onboarding.test.tsx` (5 new), `src/profile/profile.test.ts` (grams in step) |
| T-051 | Engineering standards ([docs/engineering.md](../docs/engineering.md)): spec-first workflow with `specs/` template, lint, dependency audit and size budget in CI, PR template, Dependabot, pinned Node, security headers, service worker cache cleared per build, map lookups for foods by id | `build/swStamp.test.ts` (3), `build/checkSize.test.ts` (4), `src/pwa.test.ts` (8), `src/food/search.test.ts` (9) |
| T-050 | Competitor study: 30+ Indian and international apps, coaching software, FitNotes-style loggers and the RP engine, with gaps and planning details ([study](https://claude.ai/code/artifact/4637175c-d094-4c40-80be-e4826de7c0b3)) | n/a (docs) |
| T-002 | App plan and engine spec docs | n/a (docs) |
| T-003 | Clickable prototype | n/a (prototype) |
| T-004 | Project setup: React + TypeScript + Vite | `npm run build` |
| T-005 | Diet engine | `src/engine/diet.test.ts` (18) |
| T-006 | Training engine | `src/engine/training.test.ts` (23) |
| T-008 | Task tracking files and conventions | n/a |
| T-007 | Food data plan and source rules | `src/food/food.test.ts` (8) |
| T-009 | Tests run on every push and pull request (GitHub Actions) | CI workflow |
| T-033 | Packaged Indian products from Open Food Facts: 3,547 of 25,389 usable | `src/food/off.test.ts` (3) |
| T-035 | Raw foods with Indian names: 1,461 USDA foods | `src/food/indian/raw-foods.test.ts` (5) |
| T-013 | Sign-in screens: email, Google, password reset, user or coach | `src/auth/SignIn.test.tsx` (13) |
| T-014 | Data model and privacy rules (users, coaches, food, progress, training) | `src/db/rls.test.ts` (17), run in PGlite |
| T-030 | Load USDA values for our ingredients: 26 of 28 matched, 22 of 25 dishes computed | `src/food/indian/database.test.ts` (6) |
| T-039 | Progression migration run on the live Supabase project | DK ran it in the SQL Editor |
| T-017 | Onboarding in 7 steps (about you with live BMI and waist, health checklist, training, goal with pace and goal date, Indian food habits and fasting, typical day of eating with any food from the database or the person's own entry, plan with optional suggested targets); skip remembered | `src/profile/profile.test.ts` (20), `src/profile/Onboarding.test.tsx` (9), `src/App.test.tsx` (5), `src/db/rls.test.ts` (+1) |
| T-021 | Suggested targets at the end of onboarding, applied only when the person taps "Use these targets" | `src/profile/profile.test.ts` (plan), `src/App.test.tsx` |
| T-022 | Progress tab: daily weigh-in, trend weight with weekly change and goal advice, 90-day chart, body measurements | `src/progress/progress.test.ts` (16), `src/progress/Progress.test.tsx` (4), `src/db/rls.test.ts` (+1) |
| T-028 | Live on Vercel at track-me-fit-dpvu.vercel.app with Google sign-in | DK checked sign-in on the live site |
| T-040 | Installable app: icon, manifest, service worker (opens offline), Vercel settings | `src/pwa.test.ts` (6) |
| T-024 | Weekly progression: how-did-it-feel questions after workouts, week review with per-muscle set changes (applied only when accepted), effort targets per week, deloads and new blocks | `src/training/progression.test.ts` (10), `src/training/Review.test.tsx` (3), `src/db/rls.test.ts` (+2) |
| T-023 | Workout plans (days, exercises, sets, rep ranges) and FitNotes-style logger with last time and next-load suggestion | `src/training/training.test.ts` (12), `src/training/Workouts.test.tsx` (5) |
| T-025 | Exercise library: 63 exercises with primary and secondary muscles, gym-slang search | `src/training/training.test.ts` |
| T-020 | Manual daily targets (calories, protein, carbs, fat) set by the person or coach; food log shows what is left | `src/targets/targets.test.ts` (8), `src/targets/TargetsFood.test.tsx` (4) |
| T-037 | Go live on Supabase: project in Mumbai, migration run, keys in `.env.local`, email and Google sign-in on | Live check: 13 tables respond, test sign-up created a profile |
| T-018 | Food log: day view by meal, search 7,567 foods, log by grams or portions, remove, move between days | `src/log/log.test.ts` (7), `src/log/FoodLog.test.tsx` (7), `src/food/search.test.ts` (7) |
| T-029 | Recipe calculator, raw-to-cooked converter, USDA extract script | `src/food/recipe.test.ts`, `src/food/indian/resolve.test.ts` |
| T-019 | Add your own food (per 100 g or per serving, with a check that the numbers add up) and home recipes (ingredients by raw weight, cooked weight, servings); your foods come first in search; delete them under My foods | `src/food/custom.test.ts` (10), `src/food/search.test.ts` (+1), `src/log/FoodLog.test.tsx` (+4), `src/db/rls.test.ts` (+1) |
| T-018b | Quick add (calories with optional macros, no weight) and recent and often-eaten foods with one-tap add again | `src/log/log.test.ts` (+7), `src/log/FoodLog.test.tsx` (+3), `src/db/rls.test.ts` (+1) |
