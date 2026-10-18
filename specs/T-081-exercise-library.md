# T-081: 400 to 500 gym exercises

Status: built
Task: [T-081](../tasks/TASKS.md)

## Problem
The app had 71 exercises. People could not find many common gym moves, like
a stiff-leg deadlift with an EZ bar. DK asked for at least 400 to 500
(18 Oct 2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given the library, it has 400 to 500 exercises. Every id and every name
   is used once, and old ids stay the same.
2. Given the library, every muscle has at least 10 exercises, from more than
   one kind of equipment.
3. Given common gym words, search finds the exercise. For example "stiff
   leg", "ez bar", "smith", "pec fly", "preacher", "hip thrust".
4. Given an exercise, its main muscle, helper muscles, equipment and one-joint
   flag follow simple rules. Presses help triceps, rows and pulldowns help
   biceps, and one-joint moves have at most one helper muscle.

## Rules and reasons
- Only the 12 muscles the training engine counts. Forearm, neck and inner
  thigh moves wait until the engine counts those muscles (T-082).
- Only the 7 kinds of equipment people can pick for their own exercises.
  EZ bar and trap bar count as barbell.
- Ids never change, since past sets and plans keep them.
- The list loads only with the Training tab and the coach pages, not at
  start.

## Data and privacy
- No data changes. Exercises live in the app code.

## Edge cases
- Someone's own exercise with the same name as a new built-in one keeps
  working. It stays in their list under their own id.

## Out of scope
- Videos or pictures of each exercise.
- New muscles in the engine (T-082).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4 | `src/training/exerciseLibrary.test.ts` |
