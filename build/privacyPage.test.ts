import { describe, expect, it } from 'vitest'
import { privacyPage } from './privacyPage'
import { SECTIONS } from '../src/legal/privacy'

// The privacy policy page (spec T-077).

describe('privacy page (T-077)', () => {
  it('1. has every part the stores and the DPDP Act ask for, with no scripts', () => {
    const html = privacyPage()
    for (const heading of ['What we keep', 'Why we keep it', 'Who can see it', 'Where it is kept', 'Your rights', 'How long we keep it', 'Contact us'])
      expect(html, heading).toContain(`<h2>${heading}</h2>`)
    expect(SECTIONS.length).toBeGreaterThanOrEqual(8)
    expect(html).toContain('Support may sign in as you to see the problem.')
    expect(html).toContain('Delete my account')
    expect(html).toMatch(/<p class="muted">Updated on \d{1,2} \w+ \d{4}\.<\/p>/)
    expect(html).not.toMatch(/<script/i)
    expect(html.startsWith('<!doctype html>')).toBe(true)
  })

  it('1. adds the email only once there is one, and escapes text', () => {
    expect(privacyPage('')).not.toContain('Or email us')
    expect(privacyPage('help@example.com')).toContain('<p>Or email us at help@example.com.</p>')
    expect(privacyPage('<b>@x')).toContain('&lt;b&gt;@x')
  })
})
