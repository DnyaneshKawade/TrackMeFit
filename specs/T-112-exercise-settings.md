# T-112: Exercise settings

Status: built
Task: [T-112](../tasks/TASKS.md)

## Problem
Every exercise used the gym's usual weight jump and rest time. Many Indian gyms have 1 kg plates, or machines with odd steps. People also forget their seat and pin settings. FitNotes and RP let people set these per exercise.

## Acceptance criteria
1. Given a workout card, when the person opens "Settings" and saves a weight step, rest time and notes, then the + and − buttons use the step. The rest timer uses the rest time. The card shows the notes.
2. Given an own weight step, then the weight advice moves by that step.
3. Given a step over 20 kg or a rest under 15 seconds, then the app says so and saves nothing. Empty boxes go back to the usual values.
4. Given the save fails, then the app says so and keeps the form open.
5. The database keeps each person's own settings in range, hides them from others, and "Download my data" includes them.

## Rules and reasons
- Weight step 0.25 to 20 kg. Rest 15 to 600 seconds. Notes up to 200 letters.
- In lb, the step shows doubled, like the + and − buttons.
- Warm-ups and plateau advice use the same step.

## Data and privacy
- Migration `20261124000000_exercise_settings.sql` adds `exercise_settings`, one row per person and exercise. Same row rules as favourites: the person and their coach can read, only the person can write. "Download my data" now includes it.

## Edge cases
- Settings need a connection to save. The workout keeps working offline.
- Works for built-in and own exercises.

## Out of scope
- Different steps for the same exercise at different gyms.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/exerciseSettings.test.tsx` |
| 5 | `src/db/exerciseSettings.test.ts` |
