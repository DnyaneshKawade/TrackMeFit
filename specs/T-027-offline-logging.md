# T-027: Logging without a connection

Status: agreed for T-027a (DK, 13 Oct 2026: "go as per the best possible choice")
Task: [T-027](../tasks/TASKS.md)

## Problem
Mobile data in India drops often: in lifts, basements, gyms, trains and
villages. Today "Add food" fails with "Couldn't save" and the Food tab can't
even show the day without a connection, so people stop logging. Logging should
always work and catch up by itself.

Built in two parts: T-027a food log (this change), T-027b workout sets.

## Acceptance criteria (T-027a, food)
1. Given no connection, when the person adds a food or a quick add, then it
   shows in the day at once, marked "Not synced yet", and the Food tab says how
   many entries are waiting ("2 entries saved on this phone. They'll sync when
   you're online.").
2. Given entries waiting, when the connection returns (or the app is opened
   again), then they are sent in the order they were made and the marks go
   away, without the person doing anything.
3. Given an entry sent but its answer lost (the connection dropped mid-way),
   when it is sent again, then it is saved once, not twice.
4. Given no connection, when the person removes an entry that hasn't synced,
   then it is simply dropped; when they remove a synced one, the removal waits
   and is sent later, and the entry disappears at once.
5. Given no connection, when the person opens a day they viewed before, then
   it shows from the phone, including entries waiting to sync; a day never
   viewed says it can't be loaded, as today.
6. Given recent foods were loaded before, then "Recent" in Add food still
   works offline.
7. Given the server refuses an entry for a reason other than the connection
   (for example a value out of range), when syncing, then it is dropped and
   the Food tab says "1 entry couldn't be saved", so the queue never gets
   stuck.
8. Given another person signs in on the same phone, then they never see the
   first person's saved entries (everything is kept per account).

## Rules and reasons
- Each entry gets its id on the phone when it is made, so a repeat send is
  recognised and saved once (criterion 3).
- Waiting work is kept on the phone (browser storage) per account and sent in
  order; a removal of a waiting entry cancels it instead of sending both.
- A failed send is retried only when the cause is the connection; anything
  else is reported once and dropped (criterion 7).
- The phone keeps the last 14 viewed days and the recent-foods list, so the
  stored copy stays small.
- Sync runs when the app opens, when the phone comes back online, when the
  app comes back to the front, and after each successful save.

## Data and privacy
- No migration: `food_logs.id` already accepts an id from the app; row-level
  security is unchanged (the person writes only their own rows).
- On the phone: waiting entries and a copy of recently viewed days, keyed by
  account id. Signing out clears the copy of viewed days; waiting entries stay
  so they sync on the next sign-in to the same account.
- Nothing new is sent to the server.

## Edge cases
- Storage blocked (private window): logging works online as today; offline
  adds fail with the existing message.
- Two devices: each sends its own entries; days refresh from the server when
  online.
- Very long time offline: the queue is not capped; entries are small.
- Day changed while offline: entries keep the date they were logged for.

## Out of scope
- Workout sets offline (T-027b): sessions and sets get ids on the phone the
  same way, with the last plans and history kept for the gym.
- Targets, weigh-ins, profile and custom foods offline.
- Food search offline beyond today's fallback (the bundled list).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 8 | `src/log/offlineStore.test.ts` |
| 1, 2, 4 | `src/log/FoodLog.test.tsx` (offline) |
| 3 | `src/db/rls.test.ts` (same id twice is saved once) |
