# Track Me Fit: working notes

Free, India-first diet and workout app with optional coaches. Planning docs: "Fitness App Plan" and "Training and Diet Engine" (Claude project docs).

## Stack
React + TypeScript + Vite (installable web app), Supabase (Postgres, auth, Mumbai region), Vercel hosting. Tests with Vitest.

## Rules for every change
- Follow [docs/engineering.md](docs/engineering.md): spec first, architecture, data structures, caching, testing, security, performance. These apply to every change from now on.
- A new feature or behaviour change starts with a spec in `specs/` (from `specs/_template.md`); each acceptance criterion gets a test.
- Pick data structures for how data grows: `Map`/`Set` for lookups, paging for history, database indexes for filters. No query inside a loop.
- Run `npm run check` and, for app changes, `npm run build && npm run size` before pushing. CI also runs lint and a dependency audit.
- Log the work: update `tasks/TASKS.md` (move the task, list its tests) and add an entry to `tasks/LOG.md` in the same change.
- Write tests with the code and run `npm test` and `npx tsc -b` before pushing. A task is done only when its tests pass.
- Work on a branch and open a pull request; CI must be green before merging.
- Engines in `src/engine/` stay pure functions (no I/O) and every decision returns a plain-language reason.
- Text people read follows [docs/words.md](docs/words.md): everyday words, no idioms, sentences of 20 words or fewer (`src/words.test.ts` checks it).
- Food records always carry `source` and `state`; follow `docs/food-data.md` (ODbL data stays separate, API keys stay server-side).
- Diet targets are set manually by the user or coach by default; engine suggestions are optional and must be accepted by the user.
- Never commit secrets. The repository is public.
