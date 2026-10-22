# T-160: "Same as yesterday" on each meal

Status: built
Task: [T-160](../tasks/TASKS.md)

## Problem
Many people eat the same breakfast most days. Adding each food again takes many taps. The retention study (`reviews/keep-people-coming-back.md`) asked for one tap to repeat a meal.

## Acceptance criteria
1. Given yesterday's breakfast and an empty breakfast today, when "Same as yesterday" is tapped, then all of yesterday's breakfast foods are added to today.
2. Given a meal that is empty yesterday, or already has food today, then no "Same as yesterday" button shows for it.
3. Given an earlier day is open, then the button says "Same as the day before" and copies from the day before that one.
4. Given a meal plan, then the button shows on each meal in the same way.

## Rules and reasons
- The button names the foods and their calories, so people know what it adds.
- Copies keep the same food and amount. They are not plan ticks, so the plan stays as it is.
- Foods are added one by one, so a lost connection keeps what was saved. It works offline with the same outbox.

## Data and privacy
- No database change. The day before is read with the same day query.

## Edge cases
- If the day before can't load, no button shows.
- A failed copy says so, and keeps what was already added.

## Out of scope
- Copying a whole day, or from any day other than the day before.
