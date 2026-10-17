// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { HowPlanWorks } from './HowPlanWorks'
import { calorieSteps } from '../engine/steps'

const losing = calorieSteps({ burn: 2300, weightKg: 80, rate: -0.005, sex: 'male' })

describe('how your plan works (T-076)', () => {
  afterEach(cleanup)
  it('1. a loss plan with weekly steps has three cards, and week 1 names its calories, step and goal', () => {
    render(<HowPlanWorks steps={losing} />)
    const box = screen.getByRole('region', { name: 'How your plan works' })
    expect(within(box).getByRole('heading', { name: 'Why week 1 is not a cut' })).toBeTruthy()
    expect(box.textContent).toMatch(/Week 1 is 2,300 kcal, about what you burn\./)
    expect(box.textContent).toContain(`Then it goes down 250 kcal each week, to ${losing.goalKcal.toLocaleString('en-IN')} kcal.`)
    expect(box.textContent).toMatch(/1 of 3/)
  })

  it('2. Next and Back show one card at a time, and are off at the ends', () => {
    render(<HowPlanWorks steps={losing} />)
    const back = screen.getByRole('button', { name: 'Previous card' }) as HTMLButtonElement
    const next = screen.getByRole('button', { name: 'Next card' }) as HTMLButtonElement
    expect(back.disabled).toBe(true)
    fireEvent.click(next)
    expect(screen.getByRole('heading', { name: 'Why no fried food or sweets?' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Why week 1 is not a cut' })).toBeNull()
    expect(screen.getByText(/2 of 3/)).toBeTruthy()
    fireEvent.click(next)
    expect(screen.getByRole('heading', { name: 'Why the scale moves fast at first' })).toBeTruthy()
    expect(screen.getByText('Much of that is water, not fat.')).toBeTruthy()
    expect(next.disabled).toBe(true)
    fireEvent.click(back)
    expect(screen.getByRole('heading', { name: 'Why no fried food or sweets?' })).toBeTruthy()
  })

  it('3. a plan with no weekly steps shows only the clean food card', () => {
    const { unmount } = render(<HowPlanWorks steps={null} />)
    expect(screen.getByRole('heading', { name: 'Why no fried food or sweets?' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Next card' })).toBeNull()
    unmount()
    render(<HowPlanWorks steps={calorieSteps({ burn: 2300, weightKg: 80, rate: -0.005, sex: 'male', usualKcal: 1500 })} />)
    expect(screen.queryByRole('heading', { name: 'Why week 1 is not a cut' })).toBeNull()
  })
})
