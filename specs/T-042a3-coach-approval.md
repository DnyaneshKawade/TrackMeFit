# T-042a3: Coach approval

Status: built
Task: [T-042a3](../tasks/TASKS.md)
Plan: [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a), "Coach sign-up and approval" and the Coaches page

## Problem
Anyone can sign up as a coach and see clients' health data once a client
joins. DK decided (15 Oct) that coaches start freely for now, with one admin
switch, **Coach approval**, that turns on review later. Owners also need a
Coaches page to approve, pause and set client limits.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given the switch off, a new coach is Approved and works as today. Given it
   on, a new coach is Waiting, whether they signed up by email, picked coach
   after Google, or an owner made them a coach.
2. Given coaches already working when the switch turns on, they stay Approved.
3. Given a coach who is not Approved (Waiting, Needs more, Not approved or
   Paused), the database refuses new codes, joining with an old code, reading
   or changing client data, and chat.
4. Given anyone, they can't change their own coach status, note or client
   limit, and only the coach can see or change their own details.
5. Given certificate photos, only the coach and owners can read them, and
   only the coach adds or removes them.
6. Given a Waiting coach, the Clients tab says "We're checking your details"
   and shows a form: phone, city, years coaching, a link and certificates
   with a photo each. Saving keeps the details.
7. Given Needs more, the coach sees the owner's note, answers it, and goes
   back to Waiting.
8. Given Not approved, the coach sees the reason, and can apply again only
   30 days after the decision.
9. Given a Paused coach, the Clients tab says so. Their clients see "Your
   coach is paused for now" and keep all their own data.
10. Given an owner, the Coaches page lists coaches by status with client
    counts and limits; Waiting comes oldest first. Opening one shows the
    details and certificate photos.
11. Given an owner, they approve, ask for more, decline, pause and end a
    pause, and set a client limit. Each needs a reason, writes one log row,
    and the coach sees the note in the app.
12. Given an owner, they turn the Coach approval switch on or off with a
    reason, and it is logged.
13. Given a coach approved after review, the Clients tab says so once.

## Rules and reasons
- Statuses: Approved, Waiting, Needs more, Not approved, Paused.
- The switch starts off. Turning it on changes nobody already a coach.
- The database is the lock. `is_coach()` and `is_coach_of()` need Approved,
  so codes, client data, plans, targets and check-ins all follow. Chat needs
  the coach side to be Approved too.
- Decisions allowed: Approve (from any status but Approved), Ask for more and
  Decline (from Waiting or Needs more), Pause (from Approved). Approving a
  Paused coach ends the pause.
- The reason for Ask for more, Decline and Pause is shown to the coach, so
  the form says "Note for the coach". It also goes in the admin log.
- A certificate is not required for now; the owner decides. (Open question
  in the plan: which certificates count.)

## Data and privacy
- Migration `20261107000000_coach_approval.sql`.
- `app_settings`: switches by name. Everyone signed in can read them. Only
  `admin_set_switch` writes them.
- `profiles.coach_status`, `coach_status_note`, `coach_status_at`,
  `coach_status_seen`. A trigger stops people changing them; only the
  functions below may. New coaches get their status from the switch.
- `coach_details` (phone, city, years, link, answer) and
  `coach_certificates` (name, photo path): the coach's own rows; owners read
  them through `admin_coach`.
- Private bucket `coach-certificates` at `<coach id>/<id>.jpg`. Photos are
  made smaller on the phone first, like progress photos.
- Owner functions: `admin_coaches` (50 at a time), `admin_coach`,
  `admin_coach_decision`, `admin_set_client_limit`, `admin_set_switch`. Each
  checks `need_owner()` and writes `admin_log`.
- Coach functions: `coach_send_details(answer)` and `coach_saw_status()`.
- No health data is shown on these pages.

## Edge cases
- A Waiting coach with no details yet shows "No details yet" in the queue.
- Moving a coach to "For myself" and back sets the status from the switch
  again.
- A Paused coach's links stay active, so clients come back when the pause
  ends. A client can still end the link.
- A client limit below the coach's current clients is allowed. They just
  can't add more.

## Out of scope
- The email at each decision. Supabase has no plain email sender, so this
  needs an email service and its key (T-042a3b).
- Share of clients needing attention and complaints on the Coaches page
  (with T-042c4 and T-042c5).
- View as the coach (T-042a4).

## Tests
| Criterion | Test file |
|---|---|
| 1 to 5, 11, 12 | `src/db/coachApproval.test.ts` |
| 6 to 9, 13 | `src/coach/CoachStatus.test.tsx` |
| 10 to 12 | `src/admin/Coaches.test.tsx` |
