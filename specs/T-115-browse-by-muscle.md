# T-115: Browse exercises by muscle

Status: built
Task: [T-115](../tasks/TASKS.md)

## Problem
The list has over 400 exercises. Scrolling or guessing a search word is slow. FitNotes lets people open a muscle and see its exercises.

## Acceptance criteria
1. Each main muscle's count comes from one pass over the list. The browse order names every muscle once, top of the body to the bottom.
2. Given the picker, when the person taps a muscle chip, then only exercises for that muscle show. The chip shows the count. Tapping it again, or "All", shows everything.
3. Given a search, then the chips show only muscles with a match, with their counts. A chip and the search work together.
4. Given a muscle and a search with no match, then the app says so, like "No chest exercise matches “curl”." The chosen chip stays, so it can be turned off.

## Rules and reasons
- Chips go by the main muscle only. "Also works" muscles would make every list long.
- The chips sit in one row that scrolls sideways, so the list stays near the top on a phone.

## Data and privacy
- No new data and no database change.

## Edge cases
- Own exercises show under their main muscle.
- Favourites still show first within the chosen muscle.

## Out of scope
- Filters by equipment.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/training/browseByMuscle.test.tsx` |
