// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Onboarding } from './Onboarding'
import { EMPTY_PROFILE } from './types'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import type { Food } from '../food/types'

afterEach(cleanup)

const TODAY = '2026-10-13'
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const pick = (group: string, option: string | RegExp) =>
  fireEvent.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name: option }))
const heading = () => screen.getByRole('heading', { level: 1 }).textContent

function aboutYou(sex: 'Male' | 'Female' = 'Female', waist = '', weight = '64') {
  type('Your name', 'Asha')
  pick('Sex', sex)
  type('Date of birth', '1995-06-15')
  type('Height (cm)', '160')
  type('Weight today (kg)', weight)
  if (waist) type('Waist at the belly button (cm, optional)', waist)
  click('Next')
}
function training() {
  pick('On a normal day you are', 'Mostly sitting')
  pick('Workouts a week', '3')
  pick('Lifting experience', 'New, or under a year')
  pick('Where you train', 'A gym')
  click('Next')
}
function food() {
  pick('What you eat', 'Vegetarian')
  click('Next')
}

const setup = (over: Partial<Parameters<typeof Onboarding>[0]> = {}) => {
  const onFinish = vi.fn().mockResolvedValue(undefined)
  const onSkip = vi.fn().mockResolvedValue(undefined)
  render(<Onboarding initial={EMPTY_PROFILE} onFinish={onFinish} onSkip={onSkip} today={TODAY} {...over} />)
  return { onFinish, onSkip }
}

const POHA: Food = {
  id: 'tmf:dish:poha',
  name: 'Poha',
  state: 'cooked',
  per100g: { kcal: 160, proteinG: 3, carbG: 28, fatG: 4 },
  portions: [{ label: '1 plate (200 g)', grams: 200 }],
  source: 'trackMeFit',
}

describe('onboarding', () => {
  it('checks the first step and shows BMI as soon as height and weight are in', () => {
    setup()
    click('Next')
    expect(screen.getByText('Tell us what to call you.')).toBeTruthy()
    type('Height (cm)', '160')
    type('Weight today (kg)', '64')
    expect(screen.getByRole('status', { name: 'BMI' }).textContent).toMatch(/BMI 25: in the obese range for Indian adults/)
    aboutYou()
    expect(heading()).toBe('Health check')
  })

  it('can be skipped straight to logging', async () => {
    const { onSkip } = setup()
    click('Skip setup and start logging')
    await waitFor(() => expect(onSkip).toHaveBeenCalled())
  })

  it('needs a health answer, shows doctor notes, and keeps the pace gentle when health calls for it', () => {
    setup()
    aboutYou()
    click('Next')
    expect(screen.getByText(/choose “None of these”/)).toBeTruthy()
    pick('Health conditions', 'An eating disorder, now or in the past')
    expect(screen.getByRole('note', { name: 'Please talk to your doctor' }).textContent).toMatch(/counsellor/)
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    const paces = within(screen.getByRole('group', { name: 'Pace' })).getAllByRole('button')
    expect(paces.map((b) => b.textContent)).toEqual(['Gentle'])
  })

  it('shows the goal date for a target weight and rejects a target on the wrong side', () => {
    setup()
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    expect(screen.getByRole('button', { name: 'Steady (recommended)' }).getAttribute('aria-pressed')).toBe('true')
    type('Target weight (kg, optional)', '66')
    expect(screen.getByText(/should be below your weight today/)).toBeTruthy()
    type('Target weight (kg, optional)', '58')
    expect(screen.getByRole('status', { name: 'Goal date' }).textContent).toMatch(/^First 2 kg by 1 December\. At about 0\.32 kg a week, you’d reach 58 kg by .*\. That is about 4 months\./)
  })

  it('an event date says where the pace gets you by then, and a past date is refused (T-041b)', () => {
    setup()
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    type('Target weight (kg, optional)', '58')
    type('Event date (optional)', '2027-01-26')
    expect(screen.getByRole('status', { name: 'At your event' }).textContent).toMatch(/^On 26 January 2027, you’d be about 59\.2 kg, not 58 kg\./)
    // The pace stays as chosen.
    expect(screen.getByRole('button', { name: 'Steady (recommended)' }).getAttribute('aria-pressed')).toBe('true')
    type('Event date (optional)', '2026-10-01')
    expect(screen.getByText('Pick a date after today.')).toBeTruthy()
    click('Next')
    // Still on the goal step, with the problem said again under the buttons.
    expect(screen.getAllByText('Pick a date after today.')).toHaveLength(2)
    expect(screen.getByRole('group', { name: 'Your main goal' })).toBeTruthy()
  })

  it('estimates a typical day, then offers targets the person can accept', async () => {
    const { onFinish } = setup()
    aboutYou('Female', '84')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    type('Target weight (kg, optional)', '58')
    type('Event date (optional)', '2027-03-01')
    click('Next')
    pick('What you eat', 'Jain')
    pick('Do you fast?', 'Ekadashi')
    pick('Food allergies', 'Peanuts')
    click('Next')
    expect(screen.getByRole('button', { name: 'Skip this step' })).toBeTruthy()
    for (let i = 0; i < 4; i++) click('More Roti or chapati')
    click('More Dal (no onion or garlic)')
    expect(screen.getByRole('status', { name: 'Usual day' }).textContent).toMatch(/about 520 kcal and 22 g protein/)
    click('Next')

    expect(heading()).toBe('Your plan')
    expect(screen.getByText('You’d reach 58 kg before your event on 1 March 2027.')).toBeTruthy()
    const targets = screen.getByRole('region', { name: 'Suggested daily targets' })
    // The usual day (520 kcal) is below the goal level, so there are no steps.
    expect(targets.textContent).toMatch(/Your usual day is already low\. So you start at your goal of 1,470 kcal\./)
    expect(targets.textContent).toMatch(/you’d lose about 0\.\d+ kg a week/)
    expect(targets.textContent).toMatch(/only suggestions, based on food research\. They are not medical advice\. You decide whether to follow them\./)
    click('Use these targets')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    const r = onFinish.mock.calls[0][0]
    expect(r.weightKg).toBe(64)
    expect(r.waistCm).toBe(84)
    expect(r.targets.proteinG).toBe(102)
    expect(r.profile).toMatchObject({
      fullName: 'Asha',
      sex: 'female',
      heightCm: 160,
      activity: 'desk',
      trainingDays: 3,
      experience: 'beginner',
      equipment: 'gym',
      goal: 'lose',
      goalRate: -0.005,
      targetWeightKg: 58,
      eventDate: '2027-03-01',
      dietPref: 'jain',
      fasting: ['ekadashi'],
      allergies: ['peanuts'],
      currentDiet: { counts: { 'tmf:dish:roti': 4, 'tmf:dish:jain-dal-tadka': 1 }, kcal: 520, proteinG: 22 },
    })
    expect(r.profile.onboardedAt).toBeTruthy()
    expect(r.profile.medical).toMatchObject({ diabetes: false, pregnant: false })
  })

  it('adds any food from the database or a typed-in one to the typical day', async () => {
    const { onFinish } = setup({ loadFoods: () => Promise.resolve(localFinder(createSearchIndex([POHA]))) })
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Stay as I am')
    click('Next')
    food()

    click('+ Add another food')
    type('Search foods', 'poha')
    fireEvent.click(await screen.findByRole('button', { name: /^Poha/ }))
    click('Add to your usual day')
    fireEvent.click(await screen.findByRole('button', { name: 'More Poha' }))
    expect(screen.getByLabelText('Poha per day').textContent).toBe('2')

    click('Can’t find it? Enter it yourself')
    click('Add')
    expect(screen.getByText('Say what the food is.')).toBeTruthy()
    type('Food name', 'Protein bar')
    type('Calories a day', '200')
    type('Protein (g, optional)', '20')
    click('Add')
    expect(screen.getByRole('status', { name: 'Usual day' }).textContent).toMatch(/about 840 kcal and 32 g protein/) // 2 x 320 + 200
    click('Next')
    click('I’ll set my own')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].profile.currentDiet).toEqual({
      counts: {},
      extras: [
        { id: 'tmf:dish:poha', name: 'Poha', portion: '1 plate (200 g)', kcal: 320, proteinG: 6, count: 2 },
        { id: 'custom:1:Protein bar', name: 'Protein bar', portion: 'your amount', kcal: 200, proteinG: 20, count: 1 },
      ],
      kcal: 840,
      proteinG: 32,
    })
  })

  it('lets the person decline the suggestion and set their own', async () => {
    const { onFinish } = setup()
    aboutYou('Male')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Stay as I am')
    click('Next')
    food()
    click('Skip this step')
    click('I’ll set my own')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0]).toMatchObject({ targets: null, waistCm: null, profile: { currentDiet: null, targetWeightKg: null } })
    expect(onFinish.mock.calls[0][0].profile.medical).not.toHaveProperty('pregnant')
  })

  it('offers no weight-loss targets in pregnancy', async () => {
    const { onFinish } = setup()
    aboutYou()
    pick('Health conditions', 'Pregnant or breastfeeding')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    expect(screen.getByText(/won’t set a weight-loss pace/)).toBeTruthy()
    click('Next')
    food()
    click('Skip this step')
    expect(screen.queryByRole('region', { name: 'Suggested daily targets' })).toBeNull()
    click('Start tracking')
    await waitFor(() => expect(onFinish.mock.calls[0][0].targets).toBeNull())
  })

  it('says so when saving fails', async () => {
    setup({ onFinish: vi.fn().mockRejectedValue(new Error('offline')) })
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Stay as I am')
    click('Next')
    food()
    click('Skip this step')
    click('Use these targets')
    expect(await screen.findByText(/Couldn’t save/)).toBeTruthy()
  })
})

describe('diet rules (T-057)', () => {
  const EGG: Food = { id: 'tmf:dish:egg-bhurji', name: 'Egg bhurji', state: 'cooked', per100g: { kcal: 180, proteinG: 12, carbG: 3, fatG: 13 }, portions: [], source: 'trackMeFit', tags: ['egg', 'onion_garlic'] }
  const PANEER: Food = { id: 'tmf:dish:paneer-bhurji', name: 'Paneer bhurji', state: 'cooked', per100g: { kcal: 250, proteinG: 14, carbG: 5, fatG: 19 }, portions: [], source: 'trackMeFit', tags: ['dairy'] }
  const toFood = (loadFoods?: () => Promise<ReturnType<typeof localFinder>>) => {
    const r = setup(loadFoods ? { loadFoods } : {})
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Stay as I am')
    click('Next')
    return r
  }

  it('1. labels non-veg as "I eat everything"', () => {
    toFood()
    expect(within(screen.getByRole('group', { name: 'What you eat' })).getByRole('button', { name: 'I eat everything (veg and non-veg)' })).toBeTruthy()
  })

  it('2, 3. asks about non-veg-free days only for non-veg and egg eaters, and clears them for veg', async () => {
    const { onFinish } = toFood()
    expect(screen.queryByRole('group', { name: 'Days you skip non-veg' })).toBeNull()
    pick('What you eat', 'I eat everything (veg and non-veg)')
    pick('Days you skip non-veg', 'Tue')
    pick('Days you skip non-veg', 'Sat')
    pick('Food rules', 'No onion or garlic')
    expect(within(screen.getByRole('group', { name: 'Days you skip non-veg' })).getByRole('button', { name: 'Tue' }).getAttribute('aria-pressed')).toBe('true')
    pick('What you eat', 'Eggetarian')
    expect(screen.getByRole('group', { name: 'Days you skip non-veg' })).toBeTruthy()
    pick('What you eat', 'Vegetarian')
    expect(screen.queryByRole('group', { name: 'Days you skip non-veg' })).toBeNull()
    pick('What you eat', 'I eat everything (veg and non-veg)')
    expect(within(screen.getByRole('group', { name: 'Days you skip non-veg' })).getByRole('button', { name: 'Tue' }).getAttribute('aria-pressed')).toBe('false')
    pick('Days you skip non-veg', 'Thu')
    click('Next')
    click('Skip this step')
    click('I’ll set my own')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].profile.foodRules).toEqual(['no_onion_garlic', 'nonveg_off:thu'])
  })

  it('4, 10. hides eggs and meat from a vegetarian and shows grams', () => {
    toFood()
    pick('What you eat', 'Vegetarian')
    click('Next')
    expect(screen.queryByRole('button', { name: 'More Eggs' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'More Chicken, fish or mutton' })).toBeNull()
    expect(screen.getByRole('button', { name: 'More Milk' })).toBeTruthy()
    expect(screen.getByText('1 roti, 40 g')).toBeTruthy()
  })

  it('8. "Add another food" search shows every food, whatever the diet', async () => {
    toFood(() => Promise.resolve(localFinder(createSearchIndex([EGG, PANEER]))))
    pick('What you eat', 'Vegetarian')
    click('Next')
    click('+ Add another food')
    type('Search foods', 'bhurji')
    expect(await screen.findByRole('button', { name: /^Paneer bhurji/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Egg bhurji/ })).toBeTruthy()
  })

  it('10 (T-061b). "Add another food" opens the Add food page, with amounts and quick add', async () => {
    toFood(() => Promise.resolve(localFinder(createSearchIndex([POHA, EGG]))))
    pick('What you eat', 'Vegetarian')
    click('Next')
    click('+ Add another food')
    expect(screen.getByRole('region', { name: 'Add food to your usual day' })).toBeTruthy()
    type('Search foods', 'poha')
    fireEvent.click(await screen.findByRole('button', { name: /^Poha/ }))
    type('Amount', '2')
    click('Add to your usual day')
    expect(await screen.findByText('400 g, 640 kcal')).toBeTruthy()

    click('+ Add another food')
    click('Quick add')
    type('What was it? (optional)', 'Office thali')
    type('Calories', '700')
    click('Add to your usual day')
    expect(await screen.findByText('your amount, 700 kcal')).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Usual day' }).textContent).toMatch(/about 1,?340 kcal/)
  })

  it('9. drops counts for foods the diet no longer allows', async () => {
    const { onFinish } = toFood()
    pick('What you eat', 'I eat everything (veg and non-veg)')
    click('Next')
    click('More Eggs')
    click('More Roti or chapati')
    expect(screen.getByRole('status', { name: 'Usual day' }).textContent).toMatch(/about 170 kcal/)
    click('Back')
    pick('What you eat', 'Vegetarian')
    click('Next')
    expect(screen.getByRole('status', { name: 'Usual day' }).textContent).toMatch(/about 100 kcal/)
    click('Next')
    click('I’ll set my own')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].profile.currentDiet.counts).toEqual({ 'tmf:dish:roti': 1 })
  })
})

describe('suggested day of meals (T-058b)', () => {
  const toPlan = (health = 'None of these') => {
    const r = setup()
    aboutYou()
    pick('Health conditions', health)
    click('Next')
    training()
    pick('Your main goal', 'Stay as I am')
    click('Next')
    food()
    for (let i = 0; i < 4; i++) click('More Roti or chapati')
    click('More Dal')
    click('More Rice (cooked)')
    click('Next')
    return r
  }
  const plan = () => screen.getByRole('region', { name: 'Meal plan' })

  it('1. asks first, and “Not now” keeps nothing', async () => {
    const { onFinish } = toPlan()
    expect(await screen.findByRole('heading', { name: 'Want us to suggest a day of meals?' })).toBeTruthy()
    click('Not now')
    expect(plan().textContent).toMatch(/No problem/)
    click('Use these targets')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].mealPlan).toBeNull()
  })

  it('2, 4, 10, 14. picks protein foods by diet, shows raw grams with a cooked view and swaps, and saves only on “Use this plan”', async () => {
    const { onFinish } = toPlan()
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, suggest a plan' }))
    const picks = screen.getByRole('group', { name: 'Protein foods you like' })
    expect(within(picks).queryByRole('button', { name: 'Eggs' })).toBeNull()
    expect(within(picks).queryByRole('button', { name: 'Chicken' })).toBeNull()
    pick('Protein foods you like', 'Paneer')
    pick('Protein foods you like', 'Curd and milk')
    pick('Protein foods you like', 'Dal, chana and rajma')
    expect(screen.getByRole('status', { name: 'Protein check' })).toBeTruthy()

    const lunch = screen.getByRole('region', { name: 'Lunch' })
    expect(lunch.textContent).toMatch(/Rice\D*\d+ g raw, about \d+ g cooked/)
    const cookedRice = within(lunch).getByRole('button', { name: /^Cooked weight for Rice/ })
    fireEvent.click(cookedRice)
    expect(cookedRice.getAttribute('aria-pressed')).toBe('true')
    expect(lunch.textContent).toMatch(/Rice\D*about \d+ g cooked/)

    const swap = within(lunch).getByRole('combobox', { name: /^Swap Toor dal/ })
    fireEvent.change(swap, { target: { value: 'tmf:ing:paneer' } })
    expect(within(screen.getByRole('region', { name: 'Lunch' })).getByText(/Swapped in for toor dal/)).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Plan total' }).textContent).toMatch(/kcal and \d+ g protein/)
    expect(plan().textContent).toMatch(/only suggestions, based on food research/)
    expect(onFinish).not.toHaveBeenCalled()

    click('Use this plan')
    expect(plan().textContent).toMatch(/will be saved when you finish/)
    click('Use these targets')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    const saved = onFinish.mock.calls[0][0].mealPlan
    expect(saved.picks).toContain('tmf:ing:paneer')
    expect(saved.plan.meals.find((m: { name: string }) => m.name === 'Lunch').items.some((i: { foodId: string }) => i.foodId === 'tmf:ing:paneer')).toBe(true)
  })

  it('13. offers no automatic plan when the health check says to see a doctor', async () => {
    toPlan('Diabetes or pre-diabetes')
    await waitFor(() => expect(plan().textContent).toMatch(/we don’t make an automatic meal plan/))
    expect(screen.queryByRole('button', { name: 'Yes, suggest a plan' })).toBeNull()
  })
})

describe('gain paces (T-059)', () => {
  const paceButtons = () => within(screen.getByRole('group', { name: 'Pace' })).getAllByRole('button').map((b) => b.textContent)
  const pressed = () => within(screen.getByRole('group', { name: 'Pace' })).getAllByRole('button').find((b) => b.getAttribute('aria-pressed') === 'true')?.textContent

  it('1. a healthy-weight beginner sees three paces with Steady picked, and the extra calories', () => {
    setup()
    aboutYou('Female', '', '56')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Build muscle and gain weight')
    expect(paceButtons()).toEqual(['Lean', 'Steady (recommended)', 'Faster'])
    expect(pressed()).toBe('Steady (recommended)')
    expect(screen.getByText(/about 0\.28 kg a week\. You eat 310 extra kcal a day/)).toBeTruthy()
  })

  it('3, 10. an underweight person gets Catch up, Faster picked, and a first milestone', () => {
    setup()
    aboutYou('Female', '', '45')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Build muscle and gain weight')
    expect(paceButtons()).toEqual(['Lean', 'Steady', 'Faster (recommended)', 'Catch up'])
    expect(pressed()).toBe('Faster (recommended)')
    type('Target weight (kg, optional)', '55')
    expect(screen.getByRole('status', { name: 'Goal date' }).textContent).toMatch(/^First 2 kg by .* you’d reach 55 kg by .*\. That is about 7 months\./)
  })

  it('6, 11. a health answer changed later keeps the pace gentle and re-picks it', () => {
    setup()
    aboutYou('Female', '', '45')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Build muscle and gain weight')
    pick('Pace', 'Catch up')
    click('Back')
    click('Back')
    pick('Health conditions', 'An eating disorder, now or in the past')
    click('Next')
    click('Next')
    expect(paceButtons()).toEqual(['Lean'])
    expect(pressed()).toBe('Lean')
    expect(screen.getByText(/follow their plan/)).toBeTruthy()
  })

  it('7. no gain pace during pregnancy', () => {
    setup()
    aboutYou('Female', '', '45')
    pick('Health conditions', /pregnant/i)
    click('Next')
    training()
    pick('Your main goal', 'Build muscle and gain weight')
    expect(screen.queryByRole('group', { name: 'Pace' })).toBeNull()
    expect(screen.getByText(/won’t set a weight-gain pace/)).toBeTruthy()
  })
})

describe('safe paces (T-071)', () => {
  it('4. says why weight loss isn’t offered when someone is underweight', () => {
    setup()
    aboutYou('Female', '', '44')
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    expect(screen.getByRole('note').textContent).toMatch(/already underweight, so losing weight isn’t safe/)
    expect(screen.queryByRole('group', { name: 'Pace' })).toBeNull()
  })
})


describe('calorie steps in setup (T-067a)', () => {
  it('5. shows the weekly steps, with week 1 as the targets to accept', async () => {
    const { onFinish } = setup()
    aboutYou()
    pick('Health conditions', 'None of these')
    click('Next')
    training()
    pick('Your main goal', 'Lose fat')
    click('Next')
    food()
    click('Skip this step')

    expect(heading()).toBe('Your plan')
    const targets = screen.getByRole('region', { name: 'Suggested daily targets' })
    expect(within(targets).getByRole('heading').textContent).toBe('Suggested daily targets for week 1')
    const steps = within(targets).getAllByRole('listitem').filter((li) => li.closest('ol'))
    expect(steps.map((li) => li.textContent)).toEqual(['Week 1: 1,820 kcal', 'Week 2: 1,570 kcal', 'Week 3: 1,470 kcal (your goal level)'])
    expect(targets.textContent).toMatch(/You tap OK before each new step\./)
    click('Use these targets')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].targets.kcal).toBe(1820)
  })
})
