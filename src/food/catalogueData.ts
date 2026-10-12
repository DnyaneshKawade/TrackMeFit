// Loads the bundled data tables. Imported lazily so the tables download only
// when someone opens food search.

import usdaCsv from '../../data/usda/sr_legacy_macros.csv?raw'
import offCsv from '../../data/off/india_products.csv?raw'
import { buildCatalogue } from './catalogue'
import { createSearchIndex } from './search'

export const catalogue = buildCatalogue(usdaCsv, offCsv)
export const searchIndex = createSearchIndex(catalogue)
