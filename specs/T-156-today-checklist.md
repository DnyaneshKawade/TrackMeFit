# T-156: Today checklist, "Day done" and a peek at tomorrow

Status: built
Task: [T-156](../tasks/TASKS.md)

## Problem
The Today tab showed numbers but no sense of a day finished. The screen check (`reviews/screen-check.md`) asked for a checklist, a "Day done" moment, a kind line when over, and an evening peek at tomorrow.

## Acceptance criteria
1. Given today, then a checklist shows "Today: 2 of 4 done" with meals, calories, workout and weigh-in, each ticked or not.
2. Given breakfast, lunch and dinner logged and calories within 10% of the target, then the ring shows "Day done ✓".
3. Given calories over the target by more than 10%, then the gap stays amber and a line says "That's OK. Tomorrow is a new day."
4. Given 7 pm or later, then a line shows tomorrow's plan day and the meal plan's breakfast. Before 7 pm it doesn't show.
5. Given a plan whose workouts for the week are done, then today counts as a rest day, ticked, and tomorrow says "Rest day" until a new week.
6. Given no target, there is no calories item; given no plan, there is no workout item.

## Rules and reasons
- A rest day is never a miss. Once the week's workouts are in, the workout item is ticked as "Rest day".
- Snacks are optional, so only breakfast, lunch and dinner count as meals.
- Over the target is never red and never scolds.
- Workouts load with two reads (plans and the last month), only when the Food tab opens.

## Data and privacy
- No database change.

## Edge cases
- If workouts or weigh-ins can't load, those items show as not done; the log still works.
- An earlier day shows no checklist and no peek.

## Out of scope
- The pop animation and buzz (T-157).
