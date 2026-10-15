# T-043: Workout logger to FitNotes standard

Status: T-043a built (DK, 13 Oct 2026: "go by best possible approach, proceed"); T-043b built (DK, 13 Oct 2026: "yes"); T-043c built (DK, 15 Oct 2026: "lets proceed" on editing and removing own exercises)
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

## Acceptance criteria (T-043b)
9. Given two exercises next to each other, when the person taps "Superset
   with next" on the first, then they show together as a superset. In a
   plan the link is saved with the plan, and a workout from that plan starts
   with it.
10. Given a superset, when a set of the first exercise is logged, then no
    rest timer starts and the screen says "Now do Lat pulldown". When the
    last exercise of the superset is logged, the rest timer starts with the
    longest rest of the group.
11. Given the exercise list, when the person taps the star next to an
    exercise, then it is a favourite: favourites show first, under
    "Favourites", and stay after the app is closed. Tapping again removes it.
12. Given no exercise matches, or "+ New exercise", when the person enters a
    name, the main muscle, the equipment and whether it works one joint,
    then the exercise is saved and added. It can be searched, put in plans,
    logged and counted for its muscle like the built-in ones.
13. Given a new exercise with no name, or a name already in the list, then
    it is not saved and the person sees why.

## Acceptance criteria (T-043c)
14. Given one of the person's own exercises in the list, when they tap
    "Edit", then the form opens filled in. They can change the name, main
    muscle, equipment and one-joint flag. "Save changes" saves them, and the
    new name shows in the list, plans and past workouts.
15. Given the edit form, when the new name is empty, too long or the same as
    another exercise, then the same problems as for a new exercise show.
    Keeping the exercise's own name is fine.
16. Given the edit form, when the person taps "Remove from my list", then the
    exercise leaves the list and search. Its past sets, records and plans
    keep it. "Removed X from your list. Past sets stay." shows with "Undo",
    which brings it back.

## Rules and reasons
- One tag per set: warm-up, drop set or failure. Reps in reserve stays the
  effort measure (RPE is 10 minus RIR, so we don't ask twice).
- Rest times follow the usual advice for hypertrophy: longer rests for
  compound lifts keep later sets strong (Schoenfeld 2016: 3 min beat 1 min);
  about 90 s is enough for isolation work.
- The timer runs from the clock time the set was logged, so it stays right
  if the phone sleeps or the screen changes.
- Notes are short: 200 characters for a set, 500 for a workout.
- A superset is done one set of each in turn, so the rest comes after the
  last exercise. The longest rest of the group is used, so a big lift
  still gets its full rest.
- A new exercise gets the usual weight jump and rest time of its equipment
  and type, like the built-in ones.

## Data and privacy
- Migration `20261019000000_set_tags_notes.sql`: `set_logs.tag` (warmup,
  drop or failure, or null), `set_logs.note` (up to 200 characters),
  `workout_sessions.note` (up to 500). The existing `is_warmup` is kept in
  step with the tag. Row-level security unchanged.
- Notes are private like the rest of the log; a coach with access can read
  them as they can read sets.

- (T-043b) Migration `20261020000000_exercise_library.sql`:
  `custom_exercises` gains `equipment`, `isolation` and `created_at`, with a
  check on the muscle; new table `favourite_exercises (user_id,
  exercise_id)`; `plan_exercises.superset_next`. Own exercises and
  favourites: the person writes, their active coach can read. Indexed by
  owner. Custom exercise ids are `custom:<uuid>`.
- (T-043c) Migration `20261022000000_hide_own_exercises.sql`:
  `custom_exercises.hidden` (default false). Editing and removing are
  updates by the person; the "write own" policy already allows them and
  still refuses a coach or anyone else.

## Edge cases
- Timer running when the workout is closed: it stops.
- Weight at 0 (bodyweight): − does nothing.
- A note with only spaces is not saved.

- Saving a favourite or a new exercise offline fails with a message; logging
  sets still works offline.
- A superset link on the last exercise does nothing; removing an exercise
  from a plan ends its link.

## Out of scope
- Editing a set after it is logged (remove and log again).
- Deleting an own exercise together with its past sets. Removing only hides
  it, so a mistake never loses training history (FitNotes deletes it).
- Rest time, weight step and notes for each exercise, and exercises timed or
  measured by distance (FitNotes has these; later).
- Editing built-in exercises.
- Giant sets of more than two are allowed by linking, but have no special
  screen.

## Tests
| Criterion | Test file |
|---|---|
| 1 to 7 | `src/training/Workouts.test.tsx` ("logger (T-043a)") |
| 3 | `src/training/restTimer.test.ts` |
| 5 | `src/training/training.test.ts` |
| 8 | `src/training/offlineStore.test.ts` |
| Data | `src/db/rls.test.ts` |
| 9, 10, 11, 12, 13 | `src/training/Workouts.test.tsx` ("logger (T-043b)") |
| 10 | `src/training/restTimer.test.ts` |
| 12, 13 | `src/training/training.test.ts` |
| 9 (saved) | `src/training/training.test.ts` (planFromRow) |
| Data (T-043b) | `src/db/rls.test.ts` ("exercise library (T-043b)") |
| 14, 15, 16 | `src/training/Workouts.test.tsx` ("own exercises (T-043c)") |
| 15, 16 | `src/training/training.test.ts` ("own exercises (T-043c)") |
| Data (T-043c) | `src/db/rls.test.ts` ("own exercises (T-043c)") |
