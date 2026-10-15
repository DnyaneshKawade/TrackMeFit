# T-041a: Suggested workout plan

Status: built; agreed (DK, 15 Oct 2026: "are we going to provide suggested pre designed exercise plans for users? may be by taking relevant details", then "go by the logical sequence of task")
Task: [T-041](../tasks/TASKS.md)

## Problem
New people don't know how to build a plan. RP Hypertrophy makes one from a
few answers. Onboarding already asks workouts a week, lifting experience and
where you train, so the app can suggest a plan from them.

## Acceptance criteria
1. Given the Training tab, when the person taps "Suggest a plan", then the
   choices start from their onboarding answers: workouts a week, experience
   and where they train. Each can be changed.
2. Given 2 or 3 workouts a week, then every day trains the whole body. Given
   4, upper and lower body take turns. Given 5, the days are upper, lower,
   push, pull and legs. Given 6, push, pull and legs twice.
3. Given "Home, with dumbbells", then only dumbbell, body-weight and
   kettlebell exercises are used. Given "No equipment", only body-weight
   exercises. A gym can use everything.
4. Given a beginner, then sets start lower than for someone with more
   experience. Each exercise has 2 to 4 sets, and a day never repeats an
   exercise.
5. Then the suggestion shows each day with its exercises, sets and reps, and
   the reasons in plain words.
6. Given the suggestion, when the person taps "Use this plan", then it opens
   in the plan editor. They can change anything. Nothing is saved until they
   tap "Save plan".

## Rules and reasons
- Each muscle is trained about twice a week. Reason: "Each muscle gets trained
  about twice a week."
- Weekly sets per muscle start from the training engine's starting point
  (`startingSets`): low, and lower for beginners. Reason: "Sets start low. The
  weekly review adds sets when you recover well."
- Big lifts use 6 to 10 reps (8 to 12 for beginners). One-joint exercises use
  10 to 15.
- Fewer than 2 workouts a week becomes 2, and 7 becomes 6, with the reason.
- Home and no-equipment plans with pull-ups, dips or hanging leg raises say
  "Some exercises need a bar, like pull-ups. Swap them if you have none."

## Data and privacy
- No new tables. The suggestion is made on the phone from the profile.
- Nothing is saved until the person saves the plan in the editor, as with any
  plan.
- New built-in exercises for home and no-equipment plans: body-weight squat,
  reverse lunge, inverted row, glute bridge, pike push-up, dumbbell overhead
  triceps extension, bench dip and single-leg calf raise.

## Edge cases
- No onboarding answers: 3 workouts a week, beginner, gym.
- A slot with no exercise for the equipment (for example a leg curl at home)
  is left out.

## Out of scope
- A separate step at the end of signup. People with no plan see "Suggest a
  plan" on the Training tab.
- Choosing muscles to focus on, and session length.
- Diet filtering from T-041: DK chose to show every food (T-065).

## Tests
| Criterion | Test file |
|---|---|
| 2, 3, 4 | `src/training/starterPlan.test.ts` |
| 1, 5, 6 | `src/training/Workouts.test.tsx` |
