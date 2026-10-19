// @vitest-environment jsdom
// Spec T-101b: light or dark.
import { afterEach, describe, expect, it } from 'vitest'
import { applyTheme, readTheme, saveTheme } from './theme'

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('T-101b light or dark', () => {
  it('1. the phone setting is used at first', () => {
    expect(readTheme()).toBe('system')
    applyTheme(readTheme())
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('2. a light or dark choice is saved on the phone and set on the page', () => {
    saveTheme('dark')
    expect(readTheme()).toBe('dark')
    applyTheme(readTheme())
    expect(document.documentElement.dataset.theme).toBe('dark')
    saveTheme('system')
    expect(localStorage.getItem('tmf-theme')).toBeNull()
    applyTheme('system')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('3. blocked storage falls back to the phone setting', () => {
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => {} }
    expect(readTheme(blocked)).toBe('system')
    expect(() => saveTheme('dark', blocked)).not.toThrow()
    expect(readTheme({ getItem: () => 'purple' })).toBe('system')
  })
})
