# T-132: Write "calories", not "kcal"

Status: built
Task: [T-132](../tasks/TASKS.md)

## Problem
Screens and reasons said "kcal". DK (22 Oct 2026): "kcal cannot be understood by a normal person."

## Acceptance criteria
1. Given any screen or engine reason, when it shows an amount of energy, then it says "calories", such as "1,820 calories a day".
2. Given new text, when it uses "kcal", then the simple-words test fails.

## Rules and reasons
- Only the words people read change. Field names and database columns keep `kcal`.
- `docs/words.md` now says to write "calories".

## Data and privacy
- No database change.

## Edge cases
- Labels that already say "Calories" show only the number, with no unit after it.

## Out of scope
- Short labels such as "P", "C" and "F" on food rows.
