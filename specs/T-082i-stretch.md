# T-082i: Moves that train the muscle when stretched

Status: built
Task: [T-082i](../tasks/TASKS.md)
Research: `trackmefit-notes/training-research.md`, part 4.8

## Problem
Several studies found a muscle grows a bit more when it is loaded while
long, for example seated over lying leg curls. Plans and swaps did not
use this.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Every tagged id is a real exercise, and the tag shows on it.
2. Tagged moves cover the muscles the studies looked at: hamstrings,
   triceps, biceps, calves, quads, chest and side delts.
3. The starter plan picks seated over lying leg curls, an overhead triceps
   move first and incline curls. A reason says why.
4. Swaps pick a stretch move first, with the same kit when there is one.

## Rules and reasons
- Tagged: seated leg curls and hip hinges, overhead triceps moves, incline
  and Bayesian curls, straight-knee calf raises, hack and sissy squats,
  flys, and lateral raises with the arm across or behind the body.
- The edge is small and uncertain (Wolf 2023). So it is a preference, never
  a rule. The "B" day keeps the other move for variety.
- Reason: "Some moves work the muscle when it is stretched. That may help
  it grow a bit more."
- Evidence: Maeo 2021 and 2023, Pedrosa 2022, Kassiano 2023, Kinoshita 2023.

## Data and privacy
- No data changes. The tag lives in the built-in list.

## Out of scope
- Tagging people's own exercises.
- Showing the tag in the exercise list.

## Tests
- `src/training/stretch.test.ts` (1-4)
- `src/training/starterPlan.test.ts` "5. reasons say why" (reason line)
