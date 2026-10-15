# T-026g: Program templates

Status: built
Task: [T-026g](../tasks/TASKS.md)

## Problem
A coach often gives many clients the same program.
Building it again for each client is slow, and clients often join a group partway through.

## Acceptance criteria
1. Given a coach, when they keep a plan as a template, then only coaches can, and the coach can copy it into a client's plans.
2. Given the Clients tab, when the coach makes a template, then it is listed under "Program templates".
3. Given a client page, when the coach starts a program at week 3, then the client gets a copy that is in week 3 today, and the coach's own exercises are left out with a note.
4. Given a template, when it is copied, then the copy has no ids, keeps library and client exercises, and drops days left empty.
5. Given a start week N, when the copy is made, then its start date is N-1 weeks before today.

## Rules and reasons
- Templates belong to the coach and never show on the coach's own Training tab.
- The client gets a copy. Changing the template later does not change the copy.
- "Start at week 3": "Asha joins in week 3 of 4. The light week comes after week 4, as for others on it."
- The coach's own exercises can't be copied, because the client can't see them. The note says how many were left out.

## Data and privacy
- Migration `20261102000000_program_templates.sql`: column `workout_plans.is_template`, a check that only coaches keep templates, and an index by person and kind.
- Reading and writing follow the plan rules already in place: the person and their active coach.

## Edge cases
- A template with only the coach's own exercises: "This template only has your own exercises. Add exercises from the library first."
- Offline: "Couldn’t add the program. Check your connection."

## Out of scope
- Updating every client's copy when the template changes.
- Sharing templates between coaches.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/db/coach.test.ts` |
| 2 | `src/coach/ClientView.test.tsx` |
| 3 | `src/coach/ClientView.test.tsx` |
| 4 | `src/coach/templates.test.ts` |
| 5 | `src/coach/templates.test.ts` |
