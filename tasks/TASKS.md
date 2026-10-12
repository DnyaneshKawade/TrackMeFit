# Tasks

The single list of work for Track Me Fit. Update it in the same change as the work.

- Status: `todo`, `doing`, `blocked`, `done`
- Every task that changes code lists its tests. A task is `done` only when its tests are written and passing (`npm test`).
- Finished work is also recorded in [LOG.md](LOG.md), newest first.

## Doing

| ID | Task | Owner | Tests | Notes |
|---|---|---|---|---|
| T-016 | Our own Indian food database: first 25 dishes done, growing to 300 | Claude | `src/food/recipe.test.ts`, `src/food/indian/resolve.test.ts` | See [docs/indian-food-database.md](../docs/indian-food-database.md) |

## Blocked

| ID | Task | Waiting on |
|---|---|---|
| T-010 | Import IFCT 2017 Indian foods | Permission from ICMR-NIN |
| T-011 | Import Indian Nutrient Databank recipes | Licence answer from the INDB authors |
| T-012 | USDA search through our server | USDA API key from data.gov (DK) |
| T-030 | Load USDA values for our ingredients | USDA download is blocked from Claude's cloud setup; needs fdc.nal.usda.gov allowed, or DK runs the extract script once |
| T-031 | Paneer and poha values | A photo of a common paneer and poha packet label (DK) |
| T-032 | Verify cooked weights | Someone cooks each dish and weighs the pot |

## To do

| ID | Task | Tests planned |
|---|---|---|
| T-013 | Supabase project: database, sign-in (email + Google), Mumbai region | Row-level security tests: users see only their data; coaches only their clients |
| T-014 | Data model: users, coaches, coach-client links, foods, food logs, weigh-ins, measurements, plans, workouts, sets | Schema migration tests |
| T-015 | USDA bulk importer (Foundation + SR Legacy) into our foods table | Mapper tests (started in T-007), import count check |
| T-017 | Onboarding: quick start + health check | Component tests for each step; health "yes" shows the doctor note |
| T-018 | Food logging: search, grams or portions, quick add, barcode | Unit tests for amounts; component tests for the log sheet |
| T-019 | Add your own food, product, recipe | Recipe per-100 g maths tests |
| T-020 | Manual diet targets (calories and macros), set by user or coach | Validation tests |
| T-021 | Optional "suggest my targets" using the diet engine | Engine tests (done); UI test for accept / ignore |
| T-022 | Progress tracking: weight trend, measurements, photos, strength | Trend tests (done); chart data tests |
| T-023 | Workout plan builder (manual), FitNotes-style logger | Component tests; set logging tests |
| T-024 | Auto-progression per exercise (training engine) | Engine tests (done); integration test plan to next week |
| T-025 | Exercise library: first 60 exercises with muscles (primary / secondary) | Data check: every exercise maps to muscles |
| T-026 | Coach dashboard: client list, flags, plan editing, check-ins, chat | Permission tests; flag rule tests |
| T-027 | Installable web app (PWA): offline logging, sync when online | Offline queue tests |
| T-028 | Deploy to Vercel with preview builds per pull request | CI green |

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
| T-029 | Recipe calculator, raw-to-cooked converter, USDA extract script | `src/food/recipe.test.ts`, `src/food/indian/resolve.test.ts` |
