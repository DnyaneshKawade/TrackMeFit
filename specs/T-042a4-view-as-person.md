# T-042a4: View as a person

Status: built
Task: [T-042a4](../tasks/TASKS.md)
Plan: [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a), "View as a person"

## Problem
When someone reports a problem, an owner needs to see the app exactly as
that person sees it, and fix it if needed.

DK decided on 18 Oct 2026:
- The owner is signed in as the person, with full access.
- The person is not asked and not told about each view.
- The view ends after 30 minutes with no activity.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given an owner with the second step and a reason, they start a view of a
   person. The view and its reason are saved in the admin log first.
2. Given a person, a coach, a content admin, or an owner without the second
   step, then starting a view is refused. Nobody can view their own account,
   another admin, or an account with no confirmed email.
3. Given a started view, the server function returns a one-time sign-in for
   that person only after the database allows and logs it. Nothing is
   returned when the database refuses.
4. Given a view, the app runs as the person with a bar on top: "Viewing as
   Asha" and an Exit button.
5. Given 30 minutes with no tap or key press, the view ends by itself. The
   owner is signed back in as themselves. Activity resets the 30 minutes.
6. Given Exit, the person's sign-in made for the view is ended, the owner is
   signed back in, and the end time is saved.
7. Given the app opened again later with an old view left over, it ends the
   view at once if it has been idle 30 minutes.

## Rules and reasons
- The owner gets a new sign-in as the person. The person's own sign-ins on
  their phones are not touched.
- The new sign-in is a normal one, so admin powers stay off during a view.
- Changes made during a view look like the person made them. The admin log
  shows when the owner viewed and why.
- Admins can't be viewed, so a view never gives another admin's powers.

## Data and privacy
- Migration `20261108000000_view_as.sql`: `view_sessions` (owner, person,
  reason, start, last activity, end). Owners read it; rows come only from
  `admin_start_view` and `admin_end_view`.
- Edge Function `admin-view`: checks and logs through the database as the
  owner, then makes a one-time sign-in token with the service key. The key
  stays on the server.
- The owner's own sign-in is kept on the device during the view, so it can
  be put back. It is removed when the view ends.
- Policy: the privacy policy must say that support may sign in to an
  account to fix a problem the person reports. Each view is logged.

## Edge cases
- The browser is closed during a view: the next open ends it if idle, or
  shows the bar again if not.
- The owner's sign-in has expired when the view ends: the app signs out, and
  the owner signs in again.
- The person's "last seen" on the People page shows the view's sign-in.

## Out of scope
- A list of past views in the admin pages (the admin log has them).
- The privacy policy page itself (T-077).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 6 | `src/db/viewAs.test.ts` |
| 3 | `src/admin/viewFunction.test.ts` |
| 4 to 7 | `src/admin/ViewBar.test.tsx` |
