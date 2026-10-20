# T-111: Myo-reps set type

Status: built
Task: [T-111](../tasks/TASKS.md)

## Problem
Myo-reps are one hard start set, then a few short mini-sets with very short rests. RP uses them to save time. The logger had no way to note them. Logging each mini-set as its own set made records and progress wrong.

## Acceptance criteria
1. Given a set tagged "Myo-reps", when the person enters the start set reps and mini-sets like "5 4 4", then one set is saved. Its reps are the total, and the mini-sets are kept. The set list shows "myo-reps (15 + 5 + 4 + 4)".
2. Given a myo-reps set with no mini-sets, or a mini-set over 30 reps, then the app asks for them and saves nothing.
3. Given myo-reps sets, then records, set advice and the week review use the start set only.
4. The database keeps 1 to 10 mini-sets of 1 to 30 reps, and only on a myo-reps set.

## Rules and reasons
- The reps box holds the start set. The mini-sets are added to it for the total.
- Mini-sets are usually 3 to 5 reps, with about 5 deep breaths between them.
- The start set shows true strength. Totals would make records look better than they are.

## Data and privacy
- Migration `20261123000000_myo_reps.sql` allows the `myo` tag and adds `set_logs.mini_reps`. Same row rules as other sets. "Download my data" includes it.

## Edge cases
- Up to 10 mini-sets. Spaces, commas or plus signs can separate them.
- A myo-reps set counts as one set in weekly sets.

## Out of scope
- Counting a myo-reps set as more than one set for weekly volume.
- A breath timer between mini-sets.

## Tests
| Criterion | Test file |
|---|---|
| 1-3 | `src/training/myoReps.test.tsx` |
| 4 | `src/db/myoReps.test.ts` |
