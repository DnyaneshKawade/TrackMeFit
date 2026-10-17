# T-076: How your plan works

Status: built
Task: [T-076](../tasks/TASKS.md)

## Problem
People expect a diet to start with a big cut and fast loss. Our plan starts
at their burn, leaves out fried food and sweets, and loses slowly. Without a
short reason, they may think the plan is wrong (DK, 17 Oct 2026).

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a loss plan with weekly steps, when the plan screen shows, then
   "How your plan works" has three cards: week 1, clean food and early water
   loss. Week 1 names the week 1 calories, the step size and the goal level.
2. Given the cards, when the person taps Next and Back, then one card shows at
   a time, with "1 of 3" and the like. Back is off on the first card and Next
   on the last.
3. Given a plan with no weekly steps (gain, keep or recomp), then only the
   clean food card shows, with no Next or Back.

## Rules and reasons
- Week 1: "Week 1 is X kcal, about what you burn. Then it goes down 250 kcal
  each week, to Y kcal. Small steps are easier to keep."
- Clean food: home-style foods only; fried snacks, sweets and cold drinks add
  calories but little protein. People can still log them.
- Water: weight can drop fast in the first one or two weeks. Much of that is
  water. Then loss slows to the chosen pace.

## Data and privacy
- No tables change. Nothing is stored.

## Edge cases
- Starts at the goal level (one step only): no week 1 card, only clean food.

## Out of scope
- A picture of the steps. Showing the cards again later from the Food tab.

## Tests
| Criterion | Test file |
|---|---|
| 1–3 | `src/profile/HowPlanWorks.test.tsx` |
