# T-075: Simpler words for a 10-year-old

Status: agreed (DK, 15 Oct 2026: "keep language of the app so simple that a dumb 5th grader will understand")
Task: [T-075](../tasks/TASKS.md)

## Problem
T-064 removed gym words and capped sentences at 20 words. That is still
hard for people with little English. The diet engine will add many new
screens, so the rules must be tighter before they are built.

## Acceptance criteria
1. Given any text a person reads, then it uses none of the hard words in
   [docs/words.md](../docs/words.md). The list now also has estimate(d),
   metabolism, typical, probably, guidance, nutrition, minimum, maximum,
   consult, recommend, achieve, utilise and portion.
2. Given any sentence a person reads, then it has 12 words or fewer.
3. Given the full sentences in any file (30 words or more in total), then
   they read at school grade 5 or lower (Flesch-Kincaid grade).

## Rules and reasons
- The meaning of every message stays the same; only the words change.
- Long sentences are split in two, not squeezed into fragments.
- "Typical day" is now "usual day" everywhere people read it.
- The grade uses a simple syllable count. It is a fair average, not exact,
  so the limit is checked per file and not per sentence.

## Data and privacy
No data changes. No migration.

## Edge cases
- Database column lists (snake_case, no capital letters) are not text
  people read, so the check skips them.
- Files with fewer than 30 words of full sentences are too small for a fair
  grade and are skipped.
- Food names and "kcal", "g", "kg" stay as they are.

## Out of scope
- Pictures for hard ideas (the step picture comes with the diet screens).
- Other languages. Hindi and Marathi come first, later (DK, 17 Oct 2026).
- Tests with real people, which happen outside the code.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/words.test.ts` |
| 2 | `src/words.test.ts` |
| 3 | `src/words.test.ts` |
