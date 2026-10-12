# Food data sources

Track Me Fit is free, so every food source must be free to use. We track calories, protein, carbs and fat only (no micronutrients for now).

Last reviewed: 12 Oct 2026.

## Sources

| Source | What it gives | Cost and limits | Licence | How we use it |
|---|---|---|---|---|
| [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide) | Generic ingredients (Foundation, SR Legacy), survey foods (FNDDS), US branded products | Free. API key from data.gov. 1,000 requests/hour per IP | Public domain (CC0). Credit requested | **Import** Foundation + SR Legacy into our database. API only for gap-filling, through our server so the key stays private |
| [IFCT 2017](https://github.com/ifct2017/ifct2017) (ICMR-NIN) | 542 core Indian foods, mostly raw | Free | Data owned by NIN; the open code package is AGPL-3.0. **Permission needed** | Import once permission is confirmed |
| [Indian Nutrient Databank (INDB)](https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-) | 1,014 Indian recipes and 1,095 raw items, per 100 g and per serving | Free | **No licence stated**; ask the authors | Import once permission is confirmed |
| [Open Food Facts](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/) | Packaged products by barcode, worldwide, including Indian brands | Free. Per-endpoint rate limits; custom User-Agent required | ODbL: attribution + share-alike | **Kept separate** from our own database (see below). Looked up by barcode, cached, shown with attribution |
| [OpenNutrition](https://www.opennutrition.app/download) | Large food dataset, partly from Open Food Facts | Free download | ODbL; attribution required in every screen that shows the data | Optional later; same separation rules as Open Food Facts |
| FatSecret Platform | Large food database | Free tiers are US-only; India needs a paid plan | Proprietary | **Not used** |
| Edamam, Nutritionix | Food and recipe APIs | Paid for production use | Proprietary | **Not used** |
| Kaggle "Indian food" datasets | Various dish tables | Free | Unclear origin and licences | **Not used** as a source; at most to spot-check our own values |
| Our own database (`trackMeFit`) | Curated Indian dishes, portions (katori, roti, piece), Indian brands from label photos | Free | Ours | Core of the app |
| User-added foods (`user`) | Foods, products, recipes users create | Free | Ours, private to the user by default | Private first; promoted to `trackMeFit` after review |
| AI estimates (`aiEstimate`) | Instant guess for anything missing | Per-request cost | Ours | Always labelled "estimate"; cached so each dish is estimated once |

## Rules

1. **Source on every record.** Each food keeps `source` and `sourceId` (see `src/food/types.ts`), and the app shows the source next to the food.
2. **Keep ODbL data separate.** Open Food Facts and OpenNutrition data sit in their own table and are never merged into our own database. Merging would force our whole database to become ODbL. Required credit: "© Open Food Facts contributors" with a link.
3. **API keys never reach the browser.** The USDA key lives in server environment variables (`USDA_API_KEY`). FDC deactivates keys found in public code, and this repository is public.
4. **Sanity-check every entry.** Calories should roughly match protein x 4 + carbs x 4 + fat x 9 (`energyMismatch` in `src/food/types.ts`). Entries that are far off get flagged for review.
5. **Raw vs cooked is explicit.** Every record has `state`: raw, cooked or as sold.
6. **Indian portions on top of grams.** Portions (katori, roti, piece, glass) are stored per food, in grams.

## Search order

When a user searches, results come in this order:

1. The user's own foods and recent foods
2. Our curated database (`trackMeFit`), then IFCT and INDB once permitted
3. USDA (imported)
4. Open Food Facts (barcode scans and branded products)
5. "Not found": add it yourself, or get an AI estimate

## Still to do

- [ ] Email ICMR-NIN for permission to use IFCT 2017 in a free app
- [ ] Email the INDB authors about the licence
- [ ] Get a USDA API key from data.gov (DK)
- [ ] Download the USDA Foundation + SR Legacy bulk files and write the importer
- [ ] Build the first 300 curated Indian dishes with portions
