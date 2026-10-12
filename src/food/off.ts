// Indian packaged products from Open Food Facts (ODbL). Kept apart from our own
// data: these records always carry source 'openFoodFacts' and need attribution.

import type { Food } from './types'
import { splitCsvLine } from './indian/resolve'

export const OFF_ATTRIBUTION = '© Open Food Facts contributors, openfoodfacts.org'

export function parseOffProducts(csv: string): Food[] {
  const [head, ...lines] = csv.split(/\r?\n/).filter((l) => l.trim())
  const h = splitCsvLine(head)
  const at = (name: string) => {
    const i = h.indexOf(name)
    if (i < 0) throw new Error(`Open Food Facts table is missing column ${name}`)
    return i
  }
  const [code, name, brand, kcal, p, c, f] = ['barcode', 'name', 'brand', 'kcal', 'protein_g', 'carb_g', 'fat_g'].map(at)
  return lines.map((line) => {
    const v = splitCsvLine(line)
    return {
      id: `off:${v[code]}`,
      name: v[name],
      brand: v[brand] || undefined,
      state: 'asSold',
      per100g: { kcal: Number(v[kcal]), proteinG: Number(v[p]), carbG: Number(v[c]), fatG: Number(v[f]) },
      portions: [],
      source: 'openFoodFacts',
      sourceId: v[code],
      barcode: v[code],
    }
  })
}
