# T-038: Food search from the database

Status: built (DK, 13 Oct 2026: "ok" to start T-038)
Task: [T-038](../tasks/TASKS.md)

## Problem
The first food search downloads the whole food list (about 535 KB gzip) and
searches it on the phone. On a slow connection the first search takes
seconds, and the download grows with every food we add. Search should run in
the database, return only the matches, and still rank Indian dishes first and
find foods by their regional names.

## Acceptance criteria
1. Given the foods are loaded in the database, when the person types in food
   search, then results come from the database and the food list is not
   downloaded.
2. Given a search, then results rank the same way as today: exact name, then
   alias (regional and Hinglish names such as "rajma", "dahi", "kanda
   poha"), then name or alias starting with the words, then whole words,
   then word starts; ties go to our own dishes, then raw foods, then packaged
   products, then shorter names.
3. Given a small typo ("panner", "chiken"), then the closest foods still show,
   after any real matches.
4. Given the person's own foods and recipes, then they show first, as today,
   and are never sent to or stored in the shared food tables.
5. Given the database is not reachable or the foods are not loaded yet, then
   search falls back to the bundled list, so logging always works.
6. Given recent foods in "Add food", then tapping one opens it with its
   portions, looked up by id from the database.
7. Given Open Food Facts products (ODbL), then they live in their own table,
   separate from our foods (docs/food-data.md rule 2), and still show the
   credit when opened.
8. The food tables can be read by anyone signed in or not, and written by no
   app user (admin editing comes in T-042b).

## Rules and reasons
- Two tables: `foods` (our dishes and USDA raw foods) and `off_products`
  (Open Food Facts). A view `food_search` combines them for search only.
- Search runs in `search_foods(q, lim)`, a SQL function using a trigram index
  (`pg_trgm`), so any word inside a name or alias is found without scanning
  every row. `foods_by_id(ids)` returns foods for recent entries.
- Names and aliases are stored lowercased with punctuation removed
  (`search_name`, `search_aliases`, `search_terms`), computed by the same
  `normalize` the app uses, so the app and the database agree.
- The app waits briefly while the person types (150 ms) and ignores late
  answers to earlier queries.

## Data and privacy
- Migration `20261016000000_food_search.sql`: tables `foods`, `off_products`,
  view `food_search`, functions `search_foods`, `foods_by_id`, extension
  `pg_trgm`, trigram indexes.
- Loading: `npm run export-foods` writes `data/export/foods.csv` and
  `data/export/off_products.csv` from the same data the app bundles today.
  DK imports each into its table in the Supabase Table Editor ("Import data
  from CSV"). A test checks the exported files match the bundled list.
- Read: anon and authenticated (public food facts). Write: nobody through the
  API; only the Supabase dashboard or a later admin screen.
- Nothing about the person is sent except the search words.

## Edge cases
- Empty or one-letter search: no request.
- Very fast typing: only the latest query's results are shown.
- Tables exist but are empty (before the import): fall back to the bundled
  list (criterion 5).
- A recent food whose id is no longer in the database: shown without the
  tap-to-open, as today.

## Out of scope
- Admin food editor and review queue (T-042b), IFCT and INDB imports,
  barcode scanning.

## Tests
| Criterion | Test file |
|---|---|
| 1, 4, 5, 6 | `src/food/finder.test.ts` |
| 2, 3, 7, 8 | `src/db/foodSearch.test.ts` (PGlite, real SQL) |
| export matches the bundled list | `src/food/exportFoods.test.ts` |
