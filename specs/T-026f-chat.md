# T-026f: Chat between a person and their coach

Status: built
Task: [T-026f](../tasks/TASKS.md)

## Problem
A person and their coach need a place to ask and answer quick questions.
Today they leave the app for WhatsApp, and the answers get lost there.
The app has no alerts yet, so the sender also needs an easy way to say "check the app".

## Acceptance criteria
1. Given an active coach link, when either side reads or sends, then only those two can do it, nobody changes a message, and the chat closes when the link ends.
2. Given the person sends a message, when the coach opens the Clients tab, then the client shows "1 new message", and the person sees "Seen" once the coach has read it.
3. Given a message was sent, when the sender wants to tell the other side, then a WhatsApp link carries the message and the app address. An empty message is not sent.
4. Given more than 30 messages, when the chat opens, then the latest 30 show, oldest at the top, and "Show earlier messages" loads the rest.
5. Given a client with a new message, when the coach opens that client, then the chat is on the page, and the count is gone on return.

## Rules and reasons
- A chat belongs to one coach link. A new coach never sees chat with an earlier coach.
- When the link ends, neither side can read or send in that chat.
- Messages can't be changed or deleted, so both sides see the same thing.
- "Seen" means the other side opened the chat after the message arrived.
- There are no alerts yet. After sending, the app says so and offers "Tell Neha on WhatsApp".

## Data and privacy
- Migration `20261101000000_chat.sql`: table `chat_messages` (link, sender, body up to 1000 letters, sent time, read time).
- Functions `in_link` (true for both sides of an active link) and `mark_chat_read`.
- Read and send: the two sides of an active link only. Nobody can update or delete; read time is set by `mark_chat_read`.
- Indexes on link and time, and on unread messages, for paging and counts.

## Edge cases
- Empty or blank message: "Write a message first."
- Over 1000 letters: the box stops at 1000.
- Offline: "Couldn’t send. Check your connection and try again." The text stays in the box.
- Long messages in the WhatsApp text are cut to 100 letters.

## Out of scope
- Live updates while the chat is open, and alerts. The chat loads when opened.
- Photos or files in chat.
- Admin reading chats (planned with T-042 "view as a person", read only).

## Tests
| Criterion | Test file |
|---|---|
| 1 | `src/db/coach.test.ts` |
| 2 | `src/coach/Chat.test.tsx` |
| 3 | `src/coach/Chat.test.tsx` |
| 4 | `src/coach/Chat.test.tsx` |
| 5 | `src/coach/ClientView.test.tsx` |
