// Writes data/export/foods.csv and data/export/off_products.csv from the
// bundled food list, for importing into Supabase (spec T-038).
// Run: npm run export-foods
import { readFileSync, writeFileSync } from 'node:fs'
import { buildCatalogue } from '../src/food/catalogue'
import { splitBySource, toCsv } from '../src/food/foodRows'

const usda = readFileSync('data/usda/sr_legacy_macros.csv', 'utf8')
const off = readFileSync('data/off/india_products.csv', 'utf8')
const parts = splitBySource(buildCatalogue(usda, off))
writeFileSync('data/export/foods.csv', toCsv(parts.foods))
writeFileSync('data/export/off_products.csv', toCsv(parts.off))
console.log(`foods: ${parts.foods.length}, off_products: ${parts.off.length}`)
