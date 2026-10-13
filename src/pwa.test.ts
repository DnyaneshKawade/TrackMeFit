// Install-on-phone and hosting settings.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { registerServiceWorker } from './registerSw'

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url))
const pngSize = (p: string) => {
  const b = read(p)
  expect(b.subarray(1, 4).toString()).toBe('PNG')
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

describe('installable app', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest').toString())

  it('has the manifest fields phones need to install it', () => {
    expect(manifest).toMatchObject({ name: 'Track Me Fit', start_url: '/', display: 'standalone' })
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/)
  })
  it('ships every icon it lists, at the stated size, including a maskable one', () => {
    for (const icon of manifest.icons) {
      const [w, h] = pngSize(`public${icon.src}`)
      expect(`${w}x${h}`).toBe(icon.sizes)
    }
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
    expect(pngSize('public/apple-touch-icon.png')).toEqual([180, 180])
  })
  it('links the manifest and icons from the page', () => {
    const html = read('index.html').toString()
    for (const href of ['/manifest.webmanifest', '/icon.svg', '/apple-touch-icon.png']) expect(html).toContain(`href="${href}"`)
  })
  it('only registers the service worker in production builds with support for it', () => {
    expect(registerServiceWorker({ serviceWorker: {} } as Navigator, false)).toBe(false)
    expect(registerServiceWorker({} as Navigator, true)).toBe(false)
    const registered: string[] = []
    let onLoad = () => {}
    const nav = { serviceWorker: { register: (url: string) => (registered.push(url), Promise.resolve()) } } as unknown as Navigator
    expect(registerServiceWorker(nav, true, { addEventListener: (_: string, fn: () => void) => (onLoad = fn) } as never)).toBe(true)
    onLoad()
    expect(registered).toEqual(['/sw.js'])
  })
})

describe('hosting', () => {
  const vercel = JSON.parse(read('vercel.json').toString())
  const rewrite = new RegExp(`^${vercel.rewrites[0].source.replace('/(', '/(?:')}$`)

  it('sends app paths to the app but leaves built files and icons alone', () => {
    expect(rewrite.test('/')).toBe(true)
    expect(rewrite.test('/training')).toBe(true)
    expect(rewrite.test('/assets/index-abc.js')).toBe(false)
    expect(rewrite.test('/sw.js')).toBe(false)
    expect(rewrite.test('/icon-192.png')).toBe(false)
  })
  it('never caches the service worker itself', () => {
    const sw = vercel.headers.find((h: { source: string }) => h.source === '/sw.js')
    expect(sw.headers[0]).toEqual({ key: 'Cache-Control', value: 'no-cache' })
  })
})
