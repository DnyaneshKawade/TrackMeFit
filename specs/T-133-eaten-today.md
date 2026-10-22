# T-133: What you ate today, against your targets

Status: built
Task: [T-133](../tasks/TASKS.md)

## Problem
The day card on the Food tab showed only what was left. DK (22 Oct 2026) asked to see what is eaten after ticking food, and how far it is from each target.

## Acceptance criteria
1. Given targets and nothing eaten, then the card shows 0 eaten and the whole target left, for calories, protein, carbs and fat.
2. Given a plan food is ticked, then the calories and protein eaten go up, and the amount left goes down.
3. Given more is eaten than a target, then that line says how much over, and is marked in a warning colour.

## Rules and reasons
- Ticked plan food is logged food, so it counts like any other entry.
- Numbers use Indian style with at most one decimal, such as 2,015 or 141.4 g.

## Data and privacy
- No database change.

## Edge cases
- No targets: the card isn't shown, as before.

## Out of scope
- Totals for each meal against a share of the target.
