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

describe('privacy contact and rights (T-089)', () => {
  it('1. shows the email and who answers, and how to complain to the Data Protection Board', () => {
    const html = privacyPage()
    expect(html).toContain('<p>Or email us at trackmefit5@gmail.com.</p>')
    expect(html).toContain('Track Me Fit answers every question and complaint about your data.')
    expect(html).toContain('Data Protection Board of India')
    expect(html).toContain('Coaches also give a phone number.')
  })

  it('2. says how to take back consent and what a coach sees', () => {
    const html = privacyPage()
    expect(html).toContain('<h2>Taking back your yes</h2>')
    expect(html).toContain('Stop sharing with your coach under Your coach.')
    expect(html).toContain('A coach sees your food log, targets, workouts and plans.')
    expect(html).toContain('You say yes before a coach sees anything.')
  })
})
