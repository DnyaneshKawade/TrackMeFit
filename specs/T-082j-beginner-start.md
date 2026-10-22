# T-082j: Beginner start

Status: built
Task: [T-082j](../tasks/TASKS.md)

## Problem
New lifters get stronger fast. Waiting for the top of the rep range wastes those early weeks.
Starter programs add weight every workout on big lifts, then slow down.

## Acceptance criteria
1. Given a beginner on a big lift, when every set reaches the bottom of the range, then the weight goes up next time.
2. It needs 2 or more reps left on each logged set, a jump of 10% or less, and a weight above zero.
3. Given two misses in a row, then the weight comes down a little and the lift switches to adding reps first, with a reason.
4. It lasts 8 weeks from the lift's first workout, and never comes back after a double miss.
5. In a workout, a beginner sees the added weight on a big lift, but not on a one-joint move.
6. People who are not beginners still add a rep first.

## Rules and reasons
| Case | Next time | Reason shown |
|---|---|---|
| Every set at 6+ reps, 2+ reps left | +1 weight step, 6 reps | You hit 6 reps on every set. Beginners add weight each workout. |
| Two misses in a row | About 8% lighter | Your quick beginner gains have slowed. So the weight comes down a little. Now add reps first. |
| After 8 weeks, or after a switch | Usual double progression | (the usual reasons) |

- "Beginner" is the "New, or under a year" answer in the plan questions.
- Sets with no reps left logged still count. A logged 0 or 1 holds the weight.
- One-joint moves, assisted machines and bodyweight moves keep the usual steps.

## Data and privacy
No new data. A beginner's workout reads up to 30 past workouts per lift instead of 9, in one read, to find its first date.

## Edge cases
- More than 30 past workouts: the first date is unknown, so the beginner start is over.
- A light week or a plateau step still wins.
- A 10-day break still starts lighter first (T-082f).

## Out of scope
Asking again later whether the person is still a beginner.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/engine/beginnerStart.test.ts` |
| 5–6 | `src/training/beginnerStart.test.tsx` |
