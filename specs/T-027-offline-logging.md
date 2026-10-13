# T-027: Logging without a connection

Status: built (T-027a food, T-027b workouts). Agreed by DK, 13 Oct 2026: "go as per the best possible choice"
Task: [T-027](../tasks/TASKS.md)

## Problem
Mobile data in India drops often: in lifts, basements, gyms, trains and
villages. Today "Add food" fails with "Couldn't save" and the Food tab can't
even show the day without a connection, so people stop logging. Logging should
always work and catch up by itself.

Built in two parts: T-027a food log, T-027b workouts.

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

## Acceptance criteria (T-027b, workouts)
9. Given no connection, when the person starts a workout and logs sets, then
   they show at once, each set marked "Not synced yet", and the Training tab
   and the workout say how many workout entries are waiting.
10. Given a waiting workout, when the connection returns, then the workout is
    sent before its sets, in the order they were made; sets logged while older
    work waits queue behind it.
11. Given a workout or set sent but its answer lost, when it is sent again,
    then it is saved once.
12. Given no connection, removing a waiting set drops it; removing a synced
    set waits and is sent later, and the set disappears at once.
13. Given plans, today's workouts, exercise history ("Last time" and the
    next-load suggestion) and the week review's answers were loaded before,
    then they show offline, so a planned day can be run at the gym.
14. Given the server refuses a set, it is dropped and counted ("1 workout
    entry couldn't be saved"); a refused workout takes its waiting sets and
    answers with it, so the queue never sticks.
15. Given another person signs in on the same phone, they never see the first
    person's waiting workouts or copies; signing out clears the copies.
16. Given no connection, the how-did-it-feel answers after a workout wait and
    are sent after the workout.

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

- Workouts use the same outbox, kept separately per account. The phone keeps
  the last plans, 14 viewed days, 60 exercise histories and the last week
  review's answers. Editing a plan and starting a new block still need a
  connection, as they change many rows at once.

## Out of scope
- Editing plans offline.
- Exercise history for an exercise never opened online (the suggestion
  appears once it has been seen with a connection).
- Targets, weigh-ins, profile and custom foods offline.
- Food search offline beyond today's fallback (the bundled list).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 8 | `src/log/offlineStore.test.ts` |
| 1, 2, 4 | `src/log/FoodLog.test.tsx` (offline) |
| 3 | `src/db/rls.test.ts` (same id twice is saved once) |
| 2 | `src/sync/outbox.test.ts` (a sync asked for as another ends still sends) |
| 9 to 16 | `src/training/offlineStore.test.ts` |
| 9, 10 | `src/training/Workouts.test.tsx` (offline) |
| 11 | `src/db/rls.test.ts` (workout and set sent twice) |
