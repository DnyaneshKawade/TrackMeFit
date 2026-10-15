# T-070: Change your details

Status: built
Task: [T-070](../tasks/TASKS.md)

## Problem
Sign-up answers could not be changed later. Onboarding showed once, so a new height, goal, food habit or usual day was stuck.
DK asked for a way to change them at any time after sign-up.

## Acceptance criteria
1. Given a person who finished setup, when they tap "Your details", then the setup steps open with their answers and latest weight filled in. "Save and close" saves the answers and keeps their targets and weigh-ins as they are.
2. Given changed answers, when they reach the last step, then new targets are offered. They count only after "Use these targets". A new weight is saved as today's weigh-in.
3. Given "Cancel", then nothing changes.

## Rules and reasons
- Earlier answers count as given, so steps like the health check don't ask again.
- An unchanged weight adds no weigh-in, so the weight history stays clean.
- The first sign-up date is kept.
- Suggested targets are optional and need the person's tap, as everywhere else.

## Data and privacy
- No new tables or columns. The same profile, weigh-in and target rows are saved as in setup.

## Edge cases
- No weigh-in yet: the weight box is empty and must be filled before saving.
- Coaches don't see "Your details"; they skip setup.

## Out of scope
- Weekly changes to the plan as the person goes; those come with the new diet engine.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/App.test.tsx` |
| 2 | `src/App.test.tsx` |
| 3 | `src/App.test.tsx` |
