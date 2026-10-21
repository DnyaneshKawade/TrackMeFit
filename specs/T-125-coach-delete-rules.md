# T-125: Coaches can't delete a client's plans or targets

Status: built
Task: [T-125](../tasks/TASKS.md)

## Problem
A review for DK's delete request found a gap (2026-10-21).
The database let an active coach delete a client's plans, diet targets and meal plans.
The app hides those deletes from coaches, but the API allowed them.

## Acceptance criteria
1. A coach can still add and change a client's plans, diet targets and meal plans.
2. A coach can't delete them.
3. The person can still delete their own.
4. Editing a plan still works for a coach, which deletes and re-adds its days.

## Rules and reasons
- Deleting is the person's choice. A coach changes things; they don't remove them.
- Plan days and exercises keep the old rule, since saving a plan replaces them.

## Data and privacy
- Migration `20261128000000_coach_no_deletes.sql` splits each "for all" rule by action.

## Out of scope
- Any change in the app. No screen changes.

## Tests
| Criterion | Test file |
|---|---|
| 1-4 | `src/db/coachNoDeletes.test.ts` |
