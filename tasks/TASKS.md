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
| T-017 | Onboarding: quick start + health check | Component tests for each step; health "yes" shows the doctor note |
| T-018b | Food logging extras: quick add (calories only), barcode scan, batch-cooked weighing, recent and frequent foods | Component tests for each |
| T-038 | Serve food search from the database instead of a 535 KB (gzip) download | Search tests against the server |
| T-019 | Add your own food, product, recipe | Recipe per-100 g maths tests |
| T-021 | Optional "suggest my targets" using the diet engine | Engine tests (done); UI test for accept / ignore |
| T-022 | Progress tracking: weight trend, measurements, photos, strength | Trend tests (done); chart data tests |
| T-027 | Offline logging: save food and sets without a connection and sync later | Offline queue tests |
| T-026 | Coach dashboard: client list, flags, plan editing, check-ins, chat | Permission tests; flag rule tests |

## Done

| ID | Task | Tests |
|---|---|---|
| T-001 | Research: market, competitors, RP Strength, FitNotes | n/a (docs) |
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
| T-028 | Live on Vercel at track-me-fit-dpvu.vercel.app with Google sign-in | DK checked sign-in on the live site |
| T-040 | Installable app: icon, manifest, service worker (opens offline), Vercel settings | `src/pwa.test.ts` (6) |
| T-024 | Weekly progression: how-did-it-feel questions after workouts, week review with per-muscle set changes (applied only when accepted), effort targets per week, deloads and new blocks | `src/training/progression.test.ts` (10), `src/training/Review.test.tsx` (3), `src/db/rls.test.ts` (+2) |
| T-023 | Workout plans (days, exercises, sets, rep ranges) and FitNotes-style logger with last time and next-load suggestion | `src/training/training.test.ts` (12), `src/training/Workouts.test.tsx` (5) |
| T-025 | Exercise library: 63 exercises with primary and secondary muscles, gym-slang search | `src/training/training.test.ts` |
| T-020 | Manual daily targets (calories, protein, carbs, fat) set by the person or coach; food log shows what is left | `src/targets/targets.test.ts` (8), `src/targets/TargetsFood.test.tsx` (4) |
| T-037 | Go live on Supabase: project in Mumbai, migration run, keys in `.env.local`, email and Google sign-in on | Live check: 13 tables respond, test sign-up created a profile |
| T-018 | Food log: day view by meal, search 7,567 foods, log by grams or portions, remove, move between days | `src/log/log.test.ts` (7), `src/log/FoodLog.test.tsx` (7), `src/food/search.test.ts` (7) |
| T-029 | Recipe calculator, raw-to-cooked converter, USDA extract script | `src/food/recipe.test.ts`, `src/food/indian/resolve.test.ts` |
