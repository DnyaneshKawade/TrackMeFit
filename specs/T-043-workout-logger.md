# T-043: Workout logger to FitNotes standard

Status: agreed for T-043a (DK, 13 Oct 2026: "go by best possible approach, proceed")
Task: [T-043](../tasks/TASKS.md)

## Problem
Logging a set should take one tap between sets, with sweaty hands and
little attention. Today the person types weight and reps, has no rest timer,
can't mark a warm-up or drop set, and can't write a note. FitNotes, Strong
and Hevy all do these; the competitor study put them first for training.

Built in two parts: T-043a, the logger basics (this change); T-043b,
supersets, favourites and custom exercises.

## Acceptance criteria (T-043a)
1. Given an exercise with a last time or a suggestion, then weight and reps
   are filled in, so "Log set" is one tap; after a set is logged the same
   values stay for the next set.
2. Given the weight and reps boxes, when the person taps − or +, then weight
   moves by the exercise's usual jump (2.5 kg for a barbell, 5 kg for a
   machine) and reps by 1, never below 0.
3. Given a set is logged, then a rest timer starts (2 min 30 s for big
   lifts, 1 min 30 s for isolation work), counts down on screen with −15 s,
   +15 s and Skip, and says "Rest over" (and vibrates where the phone can)
   at zero. Logging another set restarts it.
4. Given the tag buttons (Warm-up, Drop set, Failure), when one is chosen
   before logging, then the set is saved with that tag and shown with it
   ("Set 1: 40 kg × 10 · warm-up").
5. Given warm-up and drop sets, then "Last time", the next-load suggestion
   and the missed-reps count ignore them, so a warm-up never lowers the
   suggested weight.
6. Given "+ Note" on an exercise, when the person types a note and logs the
   set, then the set is saved with the note and shows it.
7. Given the workout, when the person writes in "Workout notes", then it is
   saved with the workout and shows again when the workout is opened.
8. Given no connection, then tags, set notes and workout notes wait and sync
   like sets do (T-027).

## Rules and reasons
- One tag per set: warm-up, drop set or failure. Reps in reserve stays the
  effort measure (RPE is 10 minus RIR, so we don't ask twice).
- Rest times follow the usual advice for hypertrophy: longer rests for
  compound lifts keep later sets strong (Schoenfeld 2016: 3 min beat 1 min);
  about 90 s is enough for isolation work.
- The timer runs from the clock time the set was logged, so it stays right
  if the phone sleeps or the screen changes.
- Notes are short: 200 characters for a set, 500 for a workout.

## Data and privacy
- Migration `20261019000000_set_tags_notes.sql`: `set_logs.tag` (warmup,
  drop or failure, or null), `set_logs.note` (up to 200 characters),
  `workout_sessions.note` (up to 500). The existing `is_warmup` is kept in
  step with the tag. Row-level security unchanged.
- Notes are private like the rest of the log; a coach with access can read
  them as they can read sets.

## Edge cases
- Timer running when the workout is closed: it stops.
- Weight at 0 (bodyweight): − does nothing.
- A note with only spaces is not saved.

## Out of scope (T-043b)
- Supersets, favourites, custom exercises.
- Editing a set after it is logged (remove and log again).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 7 | `src/training/Workouts.test.tsx` ("logger (T-043a)") |
| 3 | `src/training/restTimer.test.ts` |
| 5 | `src/training/training.test.ts` |
| 8 | `src/training/offlineStore.test.ts` |
| Data | `src/db/rls.test.ts` |
