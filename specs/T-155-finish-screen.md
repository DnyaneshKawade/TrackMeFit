# T-155: Workout finish screen

Status: built
Task: [T-155](../tasks/TASKS.md)

## Problem
A workout ended straight on the feedback questions. People never saw what they did. The retention study asks to show wins at the end, so effort feels worth it.

## Acceptance criteria
1. Given a workout with sets, when "Done" is tapped, then a finish screen shows the time, working sets and weight lifted, before the questions.
2. Given a set beats an earlier best, then the screen lists it with 🏆, once per exercise.
3. Given at least 2 weeks of history, then one line says how strength moved, for the exercise that grew most.
4. Given a plan with more than one day, then it shows "Next workout:" with the next day's name.
5. Given no history (offline or a first workout) or no clock, then the screen still shows sets and weight, with no records.
6. Engine: warm-ups, drop sets and cardio are left out; a drop in strength is not called steady; a clock over 5 hours is not shown.

## Rules and reasons
- Records and the trend come from one read of the last year's workouts. No query per exercise.
- The trend compares today's best one-rep max guess with the oldest workout in the last 8 weeks.
- A strength drop gives no line. A wrong "steady" would not be honest.
- No weekday for the next workout: plans don't save weekdays, so a day would be a guess.

## Data and privacy
- No database change.

## Edge cases
- A past workout logged later goes straight to closing, as before.
- The first workout with an exercise only sets the starting point, so it is not a record.

## Out of scope
- Sharing the finish screen (sharing exists in T-115).
