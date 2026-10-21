# T-120: Calendar dots by muscle, and a filter by exercise

Status: built
Task: [T-120](../tasks/TASKS.md)

## Problem
The workout calendar only shows which days had a workout. FitNotes also shows what was trained.
People want to see how often they did one exercise this month.

## Acceptance criteria
1. Given a trained day, then small dots show the muscle groups trained that day.
2. The day's label names the groups, for screen readers.
3. A key under the calendar names each colour shown this month.
4. Given "Show days with" set to an exercise, then only the days with it are marked and counted.
5. The filter stays on when moving to another month.

## Rules and reasons
- An exercise counts for its main muscle only, so a day isn't full of dots.
- 16 muscles become 7 groups: chest, back, shoulders, arms, legs, core and cardio. Seven colours are easy to tell apart.
- The groups always show in the same order.
- Colours are tokens with dark-mode versions. The key and labels carry the meaning too, so colour alone never does.

## Data and privacy
- No database change. The calendar's existing read already has each workout's exercises.

## Out of scope
- Picking which groups get which colour.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/training/calendar.test.ts` |
| 1-5 | `src/training/Records.test.tsx` |
