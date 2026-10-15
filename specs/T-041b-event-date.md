# T-041b: Event date for the goal

Status: built; agreed (DK, 15 Oct 2026: "go by the logical sequence of task", next part of T-041)
Task: [T-041](../tasks/TASKS.md)

## Problem
Many people diet for a date: a wedding, a trip, a festival. They want to know
where their pace gets them by then, without the app pushing them to go faster.

## Acceptance criteria
1. Given the goal step with "Lose fat" or "Build muscle and gain weight", then there is an
   optional "Event date". An empty date is fine. A date today or earlier says
   "Pick a date after today." A date more than 2 years away says "Pick a date
   within 2 years." Either stops "Next".
2. Given a target weight reached before the event at the chosen pace, then it
   says "You'd reach 58 kg before your event on 1 March 2027."
3. Given a target weight not reached in time, then it says the weight on the
   day, the weekly pace the target would need, and that this is faster than
   the chosen pace. The pace is not changed.
4. Given no target weight, then it says the weight on the day at this pace.
5. Then "Your plan" at the end of signup shows the same note, and the date is
   saved on the profile.

## Rules and reasons
- The note only describes the chosen pace. It never changes the pace or the
  targets: diet targets are set by the person or their coach.
- Weight on the day = today's weight plus the weekly change times the weeks
  left, the same weekly change the goal date uses.

## Data and privacy
- Migration `20261023000000_event_date.sql` adds `profiles.event_date`
  (date, optional). The profile's row-level security covers it: only the
  person writes it; they and their active coach read it.

## Edge cases
- Maintain or recomp goals: no event date field, and none is saved.
- The date field uses the phone's date picker; it can't pick a past date.

## Out of scope
- A countdown, reminders, or changing the event date after signup (the
  profile has no edit screen yet).
- Fasting days as flexible days (rest of T-041).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 5 | `src/profile/profile.test.ts` |
| 1, 3, 5 | `src/profile/Onboarding.test.tsx` |
| Data | `src/db/rls.test.ts` |
