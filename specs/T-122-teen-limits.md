# T-122: Teens follow the adult rules, after a parent's yes

Status: built
Task: [T-122](../tasks/TASKS.md)

## Problem
DK asked if any law or store rule needs the extra teen limits. India's DPDP Act needs a parent's checked yes for anyone under 18. No law or Play Store or App Store rule asks for more. So DK chose to keep only the parent's yes (20 Oct 2026).

## Acceptance criteria
1. Given a person under 18, when they pick "Lose fat", then they get the same paces and calorie steps as an adult.
2. Given a teen whose parent said yes, when they link to a coach, then the link works.

## Rules and reasons
- Kept: a parent's yes before a teen can add data (DPDP Act s.9).
- Kept: coaches must be 18 or older. A minor can't sign a contract in India to offer a paid service.
- Kept: the underweight and very-low-weight rules, which apply at every age.
- Removed: "You are still growing, so we don't suggest eating less." and "Under 18 can't have a coach".

## Data and privacy
- Migration `20261118000000_teen_coach.sql` drops the trigger `coach_clients_no_minors`.
- The privacy policy no longer says under 18 can't have a coach.

## Edge cases
- A teen still sees only the parent page until a parent says yes, so no coach link is possible before that.

## Out of scope
- BMI-for-age charts for teens. The app still uses adult BMI bands.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/profile/profile.test.ts` "under 18, losing weight follows the same rules as adults (T-122)" |
| 2 | `src/db/ageRule.test.ts` "coaches are 18 or older; people under 18 can have a coach (T-122)" |
