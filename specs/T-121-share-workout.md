# T-121: Share a workout as text

Status: built
Task: [T-121](../tasks/TASKS.md)

## Problem
People send their workouts to a friend or coach on WhatsApp. FitNotes lets them share a workout as text. We do the same.

## Acceptance criteria
1. Given a workout, when its text is made, then it lists the name, date, each exercise and its sets in order.
2. Given special sets, when the text is made, then it shows warm-ups, drop sets, failure, myo-reps, reps left and help.
3. Given the weight unit is lb, when the text is made, then weights show in lb.
4. Given set notes, when the text is made, then notes are left out; an empty workout says "No sets logged."
5. Given a workout with sets, when "Share workout" is tapped, then the phone's share sheet opens with the text.
6. Given no share sheet, when "Share workout" is tapped, then the text is copied and the app says so.
7. Given a past workout, when "Share" is tapped on its day in the calendar, then its text is shared without notes.
8. Given the copy fails, when "Share workout" is tapped, then the app says so in plain words.

## Rules and reasons
- Notes can hold private things, like pain. So they never go in the shared text.
- Warm-ups are listed but not counted in "N working sets."

## Data and privacy
- No new tables. The calendar reads one day's workouts only when Share is tapped.
- Nothing is sent by the app. The person picks where the text goes.

## Edge cases
- Closing the share sheet shows no error.
- Exercises no longer known are left out.

## Out of scope
- Sharing as a picture.
- Sharing a whole week or a plan.

## Tests
| Criterion | Test file |
|---|---|
| 1–4 | `src/engine/shareText.test.ts` |
| 5–8 | `src/training/shareWorkout.test.tsx` |
