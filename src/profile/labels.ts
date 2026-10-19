// Words for the signup answers, shared by the signup steps and the profile
// summary (T-084).

import type { Activity, DietPref, Equipment, Experience, GoalChoice } from './types'

export const STEPS = ['About you', 'Health check', 'Training', 'Your goal', 'Food habits', 'Your usual day', 'Your plan']

export const ACTIVITY: [Activity, string][] = [
  ['desk', 'Mostly sitting'],
  ['on_feet', 'On my feet a lot'],
  ['physical', 'Physical work'],
]
export const EXPERIENCE: [Experience, string][] = [
  ['beginner', 'New, or under a year'],
  ['intermediate', '1 to 3 years'],
  ['advanced', 'More than 3 years'],
]
export const EQUIPMENT: [Equipment, string][] = [
  ['gym', 'A gym'],
  ['home', 'Home, with dumbbells'],
  ['none', 'No equipment'],
]
export const GOALS: [GoalChoice, string][] = [
  ['lose', 'Lose fat'],
  ['recomp', 'Lose fat and build muscle'],
  ['gain', 'Build muscle and gain weight'],
  ['maintain', 'Stay as I am'],
]
export const DIETS: [DietPref, string][] = [
  ['veg', 'Vegetarian'],
  ['eggetarian', 'Eggetarian'],
  ['nonveg', 'I eat everything (veg and non-veg)'],
  ['vegan', 'Vegan'],
  ['jain', 'Jain'],
]
