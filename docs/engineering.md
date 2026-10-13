# Engineering standards

How Track Me Fit is built. Every change follows this, whoever makes it. `CLAUDE.md` points here.

## 1. How work flows

1. **Task.** The work is in `tasks/TASKS.md` with an ID.
2. **Spec first.** A new feature or a change in behaviour gets a short spec in `specs/` before any code (see section 2). Bug fixes and small tweaks don't need one; the PR describes them.
3. **Branch.** One branch per task (`feat/…`, `fix/…`, `docs/…`, `chore/…`). `main` is always deployable.
4. **Code with tests.** Every acceptance criterion in the spec has a test, written with the code.
5. **Check locally.** `npm run check` (types, lint, tests), then `npm run build && npm run size`.
6. **Pull request.** Fill in the template. CI must be green: types, lint, tests, build, size budget, dependency audit.
7. **Review and merge.** Merging to `main` deploys to production on Vercel. Each PR also gets a preview link.
8. **Database changes go first.** A migration is run in Supabase before its PR merges, and must work with the code already live (add columns, don't rename or drop in the same step).
9. **Log it.** `tasks/TASKS.md` and `tasks/LOG.md` change in the same PR.

**Done** means: the spec's criteria are met, their tests pass in CI, the change is live, and it is logged.

## 2. Specification-driven development

A spec says what the feature must do before we decide how. It lives in `specs/T-xxx-short-name.md`, from `specs/_template.md`:

- **Problem and who it's for**, in a few lines.
- **Acceptance criteria** written as Given / When / Then. Each one is testable and gets a test with the same words in its name.
- **Rules and reasons**: any engine decision states the plain-language reason the person will see.
- **Data and privacy**: tables, who can read and write, what is stored, what is never stored.
- **Edge cases and limits**: empty, huge, offline, slow network, wrong input.
- **Out of scope**, so the PR stays small.

The spec is updated if the behaviour changes later, so it stays the source of truth.

## 3. Architecture

```
screens (React)  →  domain modules (types + pure functions)  →  stores (interface)
                                 ↓                                  ↙        ↘
                         engines (pure, src/engine)          memory store   Supabase store
```

- **Engines are pure.** `src/engine/` takes plain data and returns decisions with reasons. No I/O, no dates read from the clock inside, so they are easy to test and reuse on a server later.
- **Stores hide storage.** Each feature has a store interface with a memory version (tests, offline) and a Supabase version. Screens never call Supabase directly.
- **Feature folders.** Code is grouped by feature (`food`, `log`, `training`, `progress`, …), each with its own types, store, screens and tests.
- **The database enforces privacy.** Row-level security is the security boundary, tested in `src/db/rls.test.ts` against every migration. The browser only ever has the anon key; anything that needs more power (admin actions, API keys) runs in a Supabase Edge Function.
- **Migrations are append-only.** Never edit a migration that has been run; add a new one.
- **Big decisions get a record.** A choice that is hard to undo (a library, a data model, a hosting change) gets a short note in `docs/decisions/` with the date, the options and why.

## 4. Data structures and algorithms

Pick the structure for how data is used and how big it can grow. Rules:

- **Look up by key with a `Map` or `Set`, not an array scan.** Example: the food index keeps `byId` for constant-time lookups of recent foods.
- **Know the growth.** The food list grows to 10,000+ and a person's log grows for years. Anything that runs per keystroke or per screen must stay fast at that size; anything over a person's history must be paged or limited (the log reads the last 200 rows for recents).
- **One pass where possible.** Totals, recents and trend weight are single passes over the data.
- **Push heavy work to the database with an index.** Filtering, sorting and searching large tables happen in Postgres with an index on every column used in a filter or a privacy rule, not by downloading rows. No query inside a loop (no N+1).
- **Measure before optimising.** Small lists don't need clever structures; add one when a test or the size budget shows the need.

Current state:
- Food search runs in Postgres (`search_foods`, trigram index, T-038) and returns only the matches. The bundled list (about 520 KB) is downloaded only as a fallback when the server can't answer.
- Food lookups by id now use a map (`src/food/search.ts`).

## 5. Caching

| Layer | What | Rule |
|---|---|---|
| HTTP (Vercel) | Built files in `/assets/` | Cached for a year as immutable; their names change with their content |
| HTTP (Vercel) | `sw.js`, `manifest.webmanifest`, pages | Not cached, so updates reach phones at once |
| Service worker | App pages | Network first, cached copy when offline |
| Service worker | Built files | Cache first. The cache is named after each build, so a new deploy clears the old files |
| Service worker | Supabase requests (sign-in, personal data) | Never cached; they always go to the network |
| In the app | Food search index | Loaded on first use, built once per session |
| In the app | Personal data | Kept in screen state, except the offline food log (T-027a): waiting entries and the last 14 viewed days in browser storage, per account. Viewed days are cleared on sign-out because phones are often shared; waiting entries stay until they sync for that account, so nothing logged is lost |
| Database | Indexes | On every filtered or privacy-rule column; summaries for admin use views |

Invalidation is by name: hashed file names for built files, a build-stamped cache name for the service worker, and no caching where freshness matters.

## 6. Testing

- **Engines and domain functions:** unit tests for every rule and its reason.
- **Stores:** memory and Supabase row mapping both tested.
- **Database:** every migration runs in PGlite, and privacy rules are tested as different users (`src/db/rls.test.ts`).
- **Screens:** React Testing Library, using roles and labels the way a person would.
- **Build:** size budget and service worker stamping tested in `build/`.
- **Not yet:** end-to-end tests in a real browser on the preview link (T-054).

Never skip or disable a test to get CI green.

## 7. Security and privacy

- No secrets in the repo; the repo is public. Only `VITE_` public values in the app.
- Security headers on every response (`vercel.json`): no MIME sniffing, no framing, strict referrer, camera only for this site.
- Dependency audit in CI blocks high and critical issues in app dependencies; Dependabot opens weekly update PRs.
- Health data follows India's DPDP Act: consent, export, delete. See the admin plan.
- A content security policy is still to do (T-052), after checking every place Supabase and Google sign-in load from.

## 8. Performance and accessibility

- Built for a low-end Android phone on a slow network. Size budgets in `build/checkSize.ts` fail CI when a file grows past its limit.
- Every control has a label, text has enough contrast, and everything works with a keyboard. Automated accessibility checks are still to do (T-055).

## 9. Releases and operations

- `main` deploys to production; every PR gets a preview.
- Roll back with Vercel's instant rollback to the previous deploy. Database changes are additive, so the previous app version still works.
- Previews currently use the live Supabase project. A separate preview project with migrations run by the Supabase CLI is to do (T-053).
- Error monitoring with personal data scrubbed comes with admin phase 3 (T-042c).
- Versions and a changelog from `tasks/LOG.md` are to do (T-056).

## 10. Where we stand (checked 13 Oct 2026)

| Practice | Status |
|---|---|
| Task list, log, branch per task, PR, CI before merge | In place |
| Tests with code, privacy rules tested on every migration | In place |
| Pure engines with reasons, store interfaces | In place |
| Spec before code | Added now (`specs/`) |
| Lint, dependency audit and size budget in CI | Added now |
| PR template, Dependabot, pinned Node version | Added now |
| Service worker cache cleared per build | Added now (before, old files piled up forever) |
| Security headers | Added now |
| Map lookups for food by id | Added now |
| Content security policy | T-052 |
| Separate preview database, migrations by CLI | T-053 |
| End-to-end browser tests | T-054 |
| Automated accessibility checks | T-055 |
| Versions and changelog | T-056 |
| Error monitoring | T-042c |
| Search in the database with an index | T-038 |
