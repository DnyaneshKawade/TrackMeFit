# T-118: Technique video links

Status: built
Task: [T-118](../tasks/TASKS.md)

## Problem
People want to see how to do an exercise with good form. The app has over 400 exercises and hosts no videos.

## Acceptance criteria
1. Every exercise gets a YouTube search link for its form. It is https and goes to youtube.com.
2. The search uses the exercise name without brackets or marks, then "proper form".
3. The workout card and the records page show "Watch how". It opens the search outside the app.

## Rules and reasons
- Search links for all exercises, as DK chose (21 Oct 2026). Hand-picked videos break when they are removed. They would also need someone to watch each one first.
- Nothing is hosted or embedded. So YouTube can't track people inside the app, and the app stays small.
- Own exercises get a search by their name too.

## Data and privacy
- No new data and no database change. The link sends only the exercise name to YouTube, and only when tapped.

## Out of scope
- Hand-picked videos and own video links. They can come later.

## Tests
| Criterion | Test file |
|---|---|
| 1-3 | `src/training/techniqueVideos.test.tsx` |
