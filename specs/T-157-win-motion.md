# T-157: Small motion and a buzz for wins

Status: built
Task: [T-157](../tasks/TASKS.md)

## Problem
Wins appeared without any feel. Fast, small feedback makes a win feel real. The screen check asked for a tick pop, a ring fill and a record buzz.

## Acceptance criteria
1. Given motion is on, then checklist ticks, "Day done ✓", meal ticks and records pop in, each under half a second.
2. Given a new record in a workout, then the phone gives a short buzz, under half a second.
3. Given the phone is set to reduce motion, then nothing pops, the ring doesn't animate, and there is no buzz.
4. Given "Motion: Off" in the Me tab, then the same happens. The choice is kept on this phone.

## Rules and reasons
- The phone's "reduce motion" setting always wins.
- The rest timer buzz stays. It is a timer, not a win.
- Kept on this phone only, like the light or dark look.

## Data and privacy
- No database change.

## Edge cases
- Phones without vibration just skip the buzz.

## Out of scope
- Sounds.
