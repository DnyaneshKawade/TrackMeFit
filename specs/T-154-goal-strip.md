# T-154: Goal strip on the Today tab and a goal line on the Progress chart

Status: built
Task: [T-154](../tasks/TASKS.md)

## Problem
People work harder when they can see the goal getting closer. The screen check (`reviews/screen-check.md`) asked for a goal strip on Today and a goal line on the weight chart.

## Acceptance criteria
1. Given a goal weight and a weigh-in, when the Today tab opens, then it shows "Goal 75 kg. 2.4 kg to go." with a bar that fills, and a tap opens Progress.
2. Given no goal weight, then no strip shows.
3. Given 2 weeks or more of weigh-ins moving toward the goal, when Progress opens, then the chart has a dashed goal line and a likely date range, called a guess.
4. Given a goal far from the weights shown, then no line is drawn, so the chart stays readable.
5. Engine: kg to go and the share done work for losing and gaining, and say when the goal is reached.
6. Engine: no date shows with under 2 weeks of data, when weight moves the wrong way, or when the goal is over 2 years away.

## Rules and reasons
- "Now" is the trend weight, not today's scale weight. Daily water swings would make the strip jump.
- The pace is the trend change over the last 14 days.
- The date is a range, 20% either side, because weight never drops in a straight line. It is called a guess, not a promise.
- The goal line shows only when the goal is within 5 kg of the weights on the chart.

## Data and privacy
- No database change. It uses the goal weight from setup and the weigh-ins.

## Edge cases
- If the weigh-ins can't load, no strip shows; the food log still works.
- A goal within 0.5 kg of the first weigh-in shows no strip.

## Out of scope
- Changing the goal weight from the strip.
