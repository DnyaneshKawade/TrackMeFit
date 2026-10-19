# T-101c: New look, part 2: screen layouts

Status: built.
Task: [T-101c](../tasks/TASKS.md)
Follows [T-101b](T-101b-look.md). Layouts come from the Calm Clinic sample designs DK picked.

## Problem
After T-101b the app had the new colours, but the old layout: tabs at the
top, a flat "left for the day" box and meals split by thin lines.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The week starts on Monday.
2. Counts each day with food once, this week only.
3. Shows how many days have food logged this week.
4. Says nothing about the week before any food is logged.

## Rules and reasons
- Colours: DK swapped Saffron for Ocean blue on a Pearl grey page
  (`#f5f6f8`), 19 Oct 2026. Only the tokens in `src/index.css`, the icon
  and the bar colour changed. Blue `#1f5fad` on white is about 6:1 contrast.
- Main tabs sit at the bottom with an icon and a word, so they are one
  thumb away (Hick's law: few, clear choices).
- "Left for the day" is a ring for calories and a bar each for protein,
  carbs and fat (goal gradient: people push on as a goal gets close).
  Going over is shown in plain words, never in red.
- With targets set, the four day-total boxes are for screen readers only, as
  the ring card shows the same day.
- The weekly count says "X of 7 days logged this week." It never shows zero
  and never scolds. Days come from the store's date range; if that fails,
  the count is left out.
- Meals, exercises and the weight trend sit on white cards with soft
  borders. The rest timer uses the accent colour.
