# T-026h: Live chat

Status: built
Task: [T-026h](../tasks/TASKS.md)

## Problem
The chat (T-026f) loaded only when opened. A reply sent while the chat was open didn't show until it was opened again.
DK asked for real-time chat, like SignalR.

## Acceptance criteria
1. Given the database, when a chat message is added or read, then Supabase Realtime sends the change.
2. Given an open chat, when the other side sends a message or reads mine, then it shows at once, once, and their message counts as read.
3. Given an open chat, when it closes, then it stops listening.

## Rules and reasons
- Realtime checks the same row-level security as reads, so only the two sides of an active link get a chat's changes.
- Each message shows once, even when my own message comes back from the live feed.

## Data and privacy
- Migration `20261103000000_live_chat.sql` adds `chat_messages` to the `supabase_realtime` publication. No new columns.

## Edge cases
- Offline or a dropped connection: the chat still loads in full when opened again.

## Out of scope
- Live "N new messages" on the Clients list, and phone alerts.

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/db/coach.test.ts` |
| 2 | `src/coach/Chat.test.tsx` |
| 3 | `src/coach/Chat.test.tsx` |
