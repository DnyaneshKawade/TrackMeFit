# T-119: Exercise goals

Status: built
Task: [T-119](../tasks/TASKS.md)

## Problem
People train towards a number, like a 100 kg squat. FitNotes lets them set a goal and see it on the graph.

## Acceptance criteria
1. The goal shows the heaviest working set with at least the goal's reps, and how far it is, like "90% of the way".
2. The first set that meets the goal marks it reached.
3. With no set of enough reps, the app says what to do. Weights show in the person's unit.
4. The goal is a dashed line on the "Heaviest weight" and "One-rep max guess" graphs. On the one-rep max graph it sits at the goal's one-rep max guess.
5. Given the exercise settings, when the person types a goal weight (and reps, 1 if empty), then records and the graph show it.
6. A goal must be 1 to 600 kg for 1 to 30 reps. Problems show in plain words. A met goal says so.
7. Assisted machines have no goal boxes, since less help is progress there.
8. The database keeps the goal in range, with both or neither of weight and reps. A row may hold only a goal.

## Rules and reasons
- Goals live in the exercise settings from T-112, set from the workout card.
- Warm-ups and drop sets don't count. Myo-reps count by their start set.

## Data and privacy
- Two columns on `exercise_settings`: `goal_kg` and `goal_reps`. Row-level security is unchanged, and the table is already in "Download my data".

## Out of scope
- Goals for assisted machines, cardio or body weight.
- A date to reach the goal by.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/engine/goal.test.ts` |
| 5-7 | `src/training/exerciseGoals.test.tsx` |
| 8 | `src/db/exerciseGoals.test.ts` |
