# T-101d: The new look on every screen

Status: built
Task: [T-101d](../tasks/TASKS.md)

## Problem
After T-101c, the Food tab looked new but other pages did not. The top bar,
Your details and the Account page still had plain browser looks. DK asked for
the app to match the design board, with a Me tab at the bottom right.

## Acceptance criteria
1. Given any time of day, when a page opens, then the top shows the day and date and "Good morning", "Good afternoon" or "Good evening" with the first name.
2. Given a name or email, then the round picture at the top shows its first letter, and tapping it opens Me.
3. Given the main tabs, then they read Today, Workouts, Progress and Me, with Me at the bottom right. Coaches and admins keep Clients and Admin before Me.
4. Given the Me tab, then it holds Your details, the account parts and a Sign out button. Back from Your details returns to Me.
5. Given the Today tab, then meals sit in one card with each meal's calories and a + button, and a floating "Add food" button picks the meal by the time.

## Rules and reasons
- "Add food" picks breakfast before 11, lunch before 4 pm, snacks before 7 pm, then dinner.
- Your details, Account, Progress and Clients use white cards on the pearl grey page, like the board.

## Data and privacy
No database change. Nothing new is stored.

## Edge cases
- No name: the greeting has no name, and the picture uses the email's first letter.
- An owner using "View as" sees no Me tab and no picture, as before.
- An older day: the floating button is hidden; each meal's + still works.

## Out of scope
A separate Food library tab from the board. Today is the food page.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2 | `src/greeting.test.ts` |
| 3, 4 | `src/App.test.tsx`, `src/auth/SignIn.test.tsx`, `src/admin/Admin.test.tsx` |
| 5 | `src/log/week.test.ts`, `src/log/FoodLog.test.tsx` |
