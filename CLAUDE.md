# Track Me Fit: working notes

Free, India-first diet and workout app with optional coaches. Planning docs: "Fitness App Plan" and "Training and Diet Engine" (Claude project docs).

## Stack
React + TypeScript + Vite (installable web app), Supabase (Postgres, auth, Mumbai region), Vercel hosting. Tests with Vitest.

## Rules for every change
- Log the work: update `tasks/TASKS.md` (move the task, list its tests) and add an entry to `tasks/LOG.md` in the same change.
- Write tests with the code and run `npm test` and `npx tsc -b` before pushing. A task is done only when its tests pass.
- Work on a branch and open a pull request; CI must be green before merging.
- Engines in `src/engine/` stay pure functions (no I/O) and every decision returns a plain-language reason.
- Food records always carry `source` and `state`; follow `docs/food-data.md` (ODbL data stays separate, API keys stay server-side).
- Diet targets are set manually by the user or coach by default; engine suggestions are optional and must be accepted by the user.
- Never commit secrets. The repository is public.
