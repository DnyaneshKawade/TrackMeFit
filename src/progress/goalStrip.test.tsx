// @vitest-environment jsdom
// Goal strip on the Today tab and goal line on the Progress chart (spec T-154).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FoodLog } from '../log/FoodLog'
import { memoryLogStore } from '../log/memoryStore'
import { shiftDate } from '../log/types'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { Progress } from './Progress'
import { memoryProgressStore } from './stores'
import { weightChart } from './types'
import { EMPTY_PROFILE } from '../profile/types'

afterEach(cleanup)

const TODAY = '2026-10-13'
// 4 weeks going down 0.5 kg a week, from 80 kg.
const WEIGH_INS = Array.from({ length: 29 }, (_, i) => ({ date: shiftDate(TODAY, i - 28), kg: Math.round((80 - (0.5 / 7) * i) * 100) / 100 }))
const showFood = (extra = {}) =>
  render(<FoodLog store={memoryLogStore()} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))} today={TODAY} {...extra} />)

describe('goal strip and goal line (T-154)', () => {
  it('1. the Today tab shows the goal and kg to go, and a tap opens Progress', async () => {
    const onGoal = vi.fn()
    showFood({ goalKg: 75, weighIns: () => Promise.resolve([{ date: TODAY, kg: 77.4 }]), onGoal })
    const strip = await screen.findByRole('button', { name: 'Goal 75 kg. 2.4 kg to go. See your progress' })
    fireEvent.click(strip)
    expect(onGoal).toHaveBeenCalledOnce()
  })

  it('2. no strip without a goal weight', async () => {
    showFood({ goalKg: null, weighIns: () => Promise.resolve(WEIGH_INS) })
    await screen.findByRole('region', { name: 'Breakfast' })
    expect(screen.queryByText(/^Goal /)).toBeNull()
  })

  it('3. the Progress chart draws the goal line and shows a likely date range', async () => {
    const profile = { ...EMPTY_PROFILE, targetWeightKg: 75 }
    const { container } = render(<Progress store={memoryProgressStore(WEIGH_INS)} goal="lose" profile={profile} today={TODAY} />)
    const goal = within(await screen.findByRole('region', { name: 'Your goal' }))
    expect(goal.getByText(/^Goal 75 kg\. [\d.]+ kg to go\.$/)).toBeTruthy()
    expect(goal.getByText(/^At this pace, you may reach it between \d+ \w+ and \d+ \w+\.$/)).toBeTruthy()
    expect(goal.getByText(/It is a guess, not a promise\.$/)).toBeTruthy()
    expect(container.querySelector('.goal-line')).not.toBeNull()
    expect(screen.getByText(/The dashed line is your goal, 75 kg\./)).toBeTruthy()
  })

  it('4. a goal far from the weights shown gets no line, so the chart stays readable', () => {
    expect(weightChart(WEIGH_INS, 320, 140, 90, 76)!.goalY).not.toBeNull()
    expect(weightChart(WEIGH_INS, 320, 140, 90, 60)!.goalY).toBeNull()
    expect(weightChart(WEIGH_INS, 320, 140)!.goalY).toBeNull()
  })
})
