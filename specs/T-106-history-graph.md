# T-106: History and graph for each exercise

Status: built
Task: [T-106](../tasks/TASKS.md)

## Problem
DK compared our logger with FitNotes. FitNotes shows every past set of an exercise by day. Its graph can show many measures over a chosen time. Ours showed one graph, and only from Records. People want to check last weeks while they lift.

## Acceptance criteria
1. Given past workouts, when History is opened, then every workout shows, newest first, with each set and a 🏆 on new records.
2. Given past workouts, when Graph is opened, then the person can pick what it shows and how far back.
3. Given a graph, when a workout is tapped, then its sets show.
4. Given an exercise done with no weight, when Graph is opened, then it only offers counts.
5. Given a workout in progress, when History is tapped on an exercise, then its history opens, and Back keeps typed weights.

## Rules and reasons
- Graph choices: one-rep max guess, heaviest weight, most reps in a set, best set (weight × reps), total weight lifted, total reps.
- Time: 1 month, 3 months (default), 6 months, 1 year, All.
- Warm-ups and drop sets are left out of the graph and records, as in T-044. History still lists them, with a label.
- A 🏆 marks a set heavier than any before, or a better one-rep max guess. The first workout only sets the start.

## Data and privacy
- No database change. Reads `exerciseHistory` (up to 200 workouts), as Records does.

## Edge cases
- One workout in the chosen time: a note asks for two workouts.
- Offline: the same "Couldn't load your records" note as Records.
- Several workouts on one day: tapping shows all of that day's sets.

## Out of scope
- Comments on each set and a muscle-grouped exercise list (FitNotes has both). Parked for later.
- Exporting the graph.

## Tests
| Criterion | Test file |
|---|---|
| 1-5 | `src/training/Records.test.tsx` (T-106 block) |
| engine | `src/engine/strengthGraph.test.ts` (3) |
