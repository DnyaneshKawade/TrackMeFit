// @vitest-environment jsdom
// Technique video search links (spec T-118).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { allExercises, exerciseById, techniqueSearchUrl } from './exercises'

afterEach(cleanup)

const TODAY = '2026-10-12'

describe('technique video links (T-118)', () => {
  it('1. every exercise gets an https YouTube search for its form', () => {
    const list = allExercises()
    expect(list.length).toBeGreaterThan(400)
    for (const e of list) {
      const url = new URL(techniqueSearchUrl(e.name))
      expect(url.protocol).toBe('https:')
      expect(url.hostname).toBe('www.youtube.com')
      expect(url.pathname).toBe('/results')
      expect(url.searchParams.get('search_query')).toMatch(/ proper form$/)
    }
  })

  it('2. the search uses the name without brackets or marks', () => {
    expect(new URL(techniqueSearchUrl('Bench press (barbell)')).searchParams.get('search_query')).toBe('Bench press barbell proper form')
    expect(new URL(techniqueSearchUrl('T-bar row & shrug?')).searchParams.get('search_query')).toBe('T bar row shrug proper form')
  })

  it('3. the workout card and the records page open the search outside the app', async () => {
    const name = exerciseById.get('bench-press')!.name
    const store = memoryWorkoutStore({
      sessions: [{ id: 's', performedOn: '2026-10-05', planDayId: null, name: 'Push', sets: [{ id: 'a', exerciseId: 'bench-press', setIndex: 0, weightKg: 60, reps: 8, rir: null }] }],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'bench press barbell' } })
    fireEvent.click(screen.getByRole('button', { name: /^Bench press \(barbell\)/ }))
    const link = within(await screen.findByRole('region', { name: name })).getByRole('link', { name: `Watch how to do ${name} on YouTube` })
    expect(link.getAttribute('href')).toBe(techniqueSearchUrl(name))
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    fireEvent.click(screen.getByRole('button', { name: `History and graph for ${name}` }))
    const page = within(await screen.findByRole('region', { name: `Records for ${name}` }))
    expect(page.getByRole('link', { name: `Watch how to do ${name} on YouTube` }).getAttribute('href')).toBe(techniqueSearchUrl(name))
  })
})
