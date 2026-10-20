// @vitest-environment jsdom
// Browse exercises by muscle in the picker (spec T-115).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ExercisePicker } from './ExercisePicker'
import { allExercises, BROWSE_ORDER, countByMuscle, MUSCLE_NAMES } from './exercises'
import { LANDMARKS, type Muscle } from '../engine/training'

afterEach(cleanup)

const open = () => render(<ExercisePicker onPick={() => {}} onClose={() => {}} />)
const chips = () => within(screen.getByRole('group', { name: 'Show by muscle' }))
const rows = () => within(screen.getAllByRole('list').at(-1)!).getAllByRole('listitem')

describe('browse exercises by muscle (T-115)', () => {
  it('1. counts each main muscle in one pass, and the order lists every muscle once', () => {
    const list = allExercises()
    const counts = countByMuscle(list)
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(list.length)
    expect(counts.get('biceps')).toBe(list.filter((e) => e.primary === 'biceps').length)
    expect([...BROWSE_ORDER].sort()).toEqual((Object.keys(LANDMARKS) as Muscle[]).sort())
  })

  it('2. a muscle chip shows only exercises for that muscle, with its count', () => {
    open()
    const n = countByMuscle(allExercises()).get('biceps')!
    const chip = chips().getByRole('button', { name: `Biceps ${n}` })
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(rows()).toHaveLength(n)
    for (const r of rows()) expect(r.textContent).toContain('Biceps')
    // Tapping it again, or All, shows everything.
    fireEvent.click(chip)
    expect(rows()).toHaveLength(allExercises().length)
  })

  it('3. works with the search, and hides muscles with no match', () => {
    open()
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'curl' } })
    const shown = chips().getAllByRole('button').map((b) => b.textContent!.replace(/ \d+$/, ''))
    expect(shown).toContain(MUSCLE_NAMES.hamstrings)
    expect(shown).not.toContain(MUSCLE_NAMES.chest)
    fireEvent.click(chips().getByRole('button', { name: /^Hamstrings/ }))
    expect(rows().length).toBeGreaterThan(0)
    for (const r of rows()) expect(r.textContent).toMatch(/curl/i)
    fireEvent.click(chips().getByRole('button', { name: 'All' }))
    expect(rows().some((r) => r.textContent!.includes('Biceps'))).toBe(true)
  })

  it('4. says when nothing matches for the muscle', () => {
    open()
    fireEvent.click(chips().getByRole('button', { name: /^Chest/ }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'curl' } })
    expect(screen.getByText('No chest exercise matches “curl”.')).toBeTruthy()
    // The chosen muscle stays, so it can be turned off.
    expect(chips().getByRole('button', { name: 'Chest 0' }).getAttribute('aria-pressed')).toBe('true')
  })
})
