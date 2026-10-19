# T-092: One tidy Account page

Status: built
Task: [T-092](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
The Account page was a list of data tools. It did not link to "Your
details" or say who can see your data. Settings pages work best when each
row says what it is set to now (Android settings guidelines).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Parts come in this order: Your details, Sign-in and security, Your
   coach, Your data and privacy, Delete my account. Each shows what it is
   set to now, like the coach's name and the date sharing started.
2. With no coach, it says nobody else sees the data.

## Rules and reasons
- "Sign out on all devices" sits under Sign-in and security.
- Joining or stopping a coach stays on the Progress tab. The Account page
  links there, so there is one place to change it.
- Coaches see no "Your coach" part and no "Your details" part.

## Data and privacy
- No migration.

## Tests
- `src/account/Account.test.tsx` "one tidy Account page (T-092)" (1, 2)
