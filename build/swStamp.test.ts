import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildId, stampServiceWorker } from './swStamp'

const sw = readFileSync(new URL('../public/sw.js', import.meta.url)).toString()

describe('service worker cache name per build', () => {
  it('changes when the built files change, not when their order does', () => {
    const a = buildId(['assets/index-abc.js', 'assets/index-def.css'])
    expect(a).toMatch(/^[0-9a-f]{10}$/)
    expect(buildId(['assets/index-def.css', 'assets/index-abc.js'])).toBe(a)
    expect(buildId(['assets/index-xyz.js', 'assets/index-def.css'])).not.toBe(a)
  })
  it('stamps the cache name in the real sw.js and nothing else', () => {
    const out = stampServiceWorker(sw, '0123456789')
    expect(out).toContain("const CACHE = 'tmf-0123456789'")
    expect(out.replace("'tmf-0123456789'", "'tmf-v1'")).toBe(sw)
  })
  it('fails the build if sw.js loses its cache line', () => {
    expect(() => stampServiceWorker('self.addEventListener()', 'x')).toThrow(/CACHE/)
  })
})
