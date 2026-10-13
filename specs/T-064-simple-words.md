# T-064: Simple words across the app

Status: agreed (DK, 13 Oct 2026: "lets keep the verbiage simple around the whole app, to make easy for indians with not much english expierence to understand")
Task: [T-064](../tasks/TASKS.md)

## Problem
Many people using the app read English as a second or third language.
Gym and nutrition words (trend weight, deload, reps in reserve, deficit,
macros, sync) and English idioms ("done its job", "stick to") make screens
hard to follow. New screens should not bring them back.

## Acceptance criteria
1. Given any text a person reads (screens, buttons, errors, and the reasons
   engines give), then it uses none of the hard words in
   [docs/words.md](../docs/words.md), except where a gym word is explained
   once next to its simple word.
2. Given any sentence a person reads, then it has 20 words or fewer.

## Rules and reasons
The rules and the word list are in [docs/words.md](../docs/words.md). The
meaning of every message stays the same; only the words change.

## Data and privacy
No data changes. No migration.

## Edge cases
- Food names from the food database are left as they are (they are names).
- Code names (functions, columns) keep their gym terms; only text people
  read changes.
- "kcal", "g", "kg" stay: they are on every food packet in India.

## Out of scope
- Hindi or other Indian languages (a later task if wanted).
- Planning docs and specs, which people using the app don't read.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/words.test.ts` |
| 2 | `src/words.test.ts` |
