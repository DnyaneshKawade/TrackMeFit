import { describe, expect, it } from 'vitest'
import offCsv from '../../data/off/india_products.csv?raw'
import { parseOffProducts } from './off'

const products = parseOffProducts(offCsv)

describe('Open Food Facts Indian products', () => {
  it('loads more than 3,000 products with unique barcodes', () => {
    expect(products.length).toBeGreaterThan(3000)
    expect(new Set(products.map((p) => p.barcode)).size).toBe(products.length)
  })

  it('keeps every product separate and attributed', () => {
    for (const p of products) {
      expect(p.source).toBe('openFoodFacts')
      expect(p.id.startsWith('off:')).toBe(true)
      expect(p.name.length).toBeGreaterThan(0)
    }
  })

  it('has possible values only', () => {
    for (const p of products) {
      const { kcal, proteinG, carbG, fatG } = p.per100g
      expect(kcal, p.id).toBeGreaterThanOrEqual(0)
      expect(kcal, p.id).toBeLessThanOrEqual(950)
      expect(proteinG + carbG + fatG, p.id).toBeLessThanOrEqual(105)
    }
  })
})
