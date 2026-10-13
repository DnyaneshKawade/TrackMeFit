import { describe, expect, it } from 'vitest'
import { overBudget } from './checkSize'

describe('size budget', () => {
  const budgets = [{ prefix: 'index-', ext: '.js', maxGzipKb: 100 }]
  it('passes files within budget and small files without one', () => {
    expect(overBudget([{ name: 'index-a1.js', gzipKb: 99 }, { name: 'browser-b2.js', gzipKb: 1 }], budgets)).toEqual([])
  })
  it('names a file over its budget', () => {
    expect(overBudget([{ name: 'index-a1.js', gzipKb: 120 }], budgets)).toEqual(['index-a1.js is 120.0 KB gzip, over its 100 KB budget'])
  })
  it('flags a large new file that has no budget yet', () => {
    expect(overBudget([{ name: 'charts-c3.js', gzipKb: 80 }], budgets)[0]).toMatch(/has no budget/)
  })
  it('keeps the index CSS rule separate from the index JS rule', () => {
    expect(overBudget([{ name: 'index-a1.css', gzipKb: 120 }], budgets)[0]).toMatch(/has no budget/)
  })
})
