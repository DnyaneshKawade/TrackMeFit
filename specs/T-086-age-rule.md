# T-086: One age rule, with a parent's yes

Status: built
Task: [T-086](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The policy said 18 and over, but setup let people in from 13. Skipping
setup, coaches and Google sign-ups were never asked their age. Under India's
DPDP Act a child is under 18, and their data needs a parent's checked yes.

DK decided on 19 Oct 2026: 18 and over as normal; under 18 with a parent's
yes, by the parent's own sign-in.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Everyone answers their date of birth once, coaches and Google sign-ups
   too. It can't be skipped. Under 13 can't go on.
2. From 13 to 17, a teen waits for a parent. The teen shows a code. A parent
   with their own adult account types it under Account, sees what it means,
   and says yes. The teen can then use the app. Until then the database
   refuses the teen's new data.
3. The parent can take back their yes. The teen then waits again. The teen
   sees which parent said yes.
4. Coaches must be 18 or older. People under 18 can't link to a coach, and
   a Google teen isn't offered the coach role.
5. Under 18, the app suggests no calorie cut, with a reason.

## Rules and reasons
- DPDP Rules 2025, Rule 10: a parent who is a known adult user of the app
  counts as a checked parent. So the parent signs in with their own account.
- The code has 8 letters and numbers and works for 7 days. A new code
  stops the old one.
- Teens can't have a coach for now: a stranger seeing a child's weight and
  photos needs more care than this first version has.
- Teens are still growing, so the engine never steps calories down for them.
  "Lose fat" and "Lose fat and build muscle" both start at the burn number.
- Support's View as isn't held up by the age or parent step.

## Data and privacy
- Migration `20261114000000_age_rule.sql`: four columns on `profiles`
  (parent, time of the yes, code, code end), definer functions for the
  code, the yes and taking it back, and a restrictive rule on the data
  tables while a teen waits.
- The parent sees only the child's name and the date of the yes, not their data.
- The privacy page's Age part says all this.

## Tests
- `src/db/ageRule.test.ts` "one age rule (T-086)" (1, 2, 3, 4)
- `src/App.test.tsx` "one age rule (T-086)" (1, 2, 4)
- `src/family/FamilyPart.test.tsx` "one age rule (T-086)" (2, 3)
- `src/profile/profile.test.ts` "one age rule (T-086)" (5)
