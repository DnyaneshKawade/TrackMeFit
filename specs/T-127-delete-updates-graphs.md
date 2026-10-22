# T-127: Graphs update at once after a delete

Status: built
Task: [T-127](../tasks/TASKS.md)

## Problem
A deleted workout still showed in graphs. Online, a delete is sent at once. But with a weak signal, or other work waiting, the delete waits on the phone. Graphs read the server, so they still showed it.

## Acceptance criteria
1. Given a workout or a set is deleted and the delete is still waiting, when graphs, records, history or the calendar load, then they leave it out.

## Rules and reasons
- A deleted workout should be gone everywhere at once, not only on the workout list.

## Data and privacy
- No database change. The waiting delete keeps the ids of its sets on the phone.

## Edge cases
- A workout made and deleted offline is never sent, as before.
- After the delete is sent, the server no longer has it, so nothing changes.

## Out of scope
- Graphs while fully offline (they need a connection, as before).

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/training/offlineStore.test.ts` |
