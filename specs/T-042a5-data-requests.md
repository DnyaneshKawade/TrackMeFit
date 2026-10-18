# T-042a5: Data requests

Status: built
Task: [T-042a5](../tasks/TASKS.md)
Plan: [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a), "Data requests"

## Problem
India's DPDP Act gives people the right to see, correct and erase their
data. Play Store and App Store also need a "Delete my account" button
inside the app. Today only an owner can delete an account, and deleting a
coach who set a client's targets fails.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given a person, "Download my data" gives one file with all of their
   data: every table that holds it, and links to their photos.
2. Given a person, "Delete my account" removes all their rows and files,
   after they type DELETE. Their sign-in ends.
3. Given an admin, deleting their own account is refused until they are
   removed as admin.
4. Given a coach who set targets, plans or check-in replies for clients,
   deleting the coach works. The client keeps those rows, with no coach
   name.
5. Given a person, they ask for a correction with a note, and see the
   answer when it is closed.
6. Given an owner, the Requests page lists open requests oldest first with
   the days left out of 90. Closing one needs an answer and is logged.
7. Given a person, they can't read another person's requests or answer
   their own.

## Rules and reasons
- Export and delete happen at once, so they need no request.
- A correction is a request, because most data is already editable in the
  app. The owner answers within 90 days, as the DPDP Rules expect for
  complaints.
- The delete runs on the server: only the service key can remove a sign-in.
- Photo links in the export last 7 days.

## Data and privacy
- Migration `20261109000000_data_requests.sql`.
- `data_requests`: person, note, open or closed, answer, who closed it.
  The person reads and adds their own; owners read all through
  `admin_requests` and close with `admin_close_request`.
- `export_my_data()` returns every table's rows for the signed-in person.
- `prepare_delete_me()` refuses admins.
- The admin log keeps who an admin acted on, as a record of admin work.
- Columns that name who set something (`set_by`, `created_by`,
  `updated_by`, `replied_by`) become empty when that person is deleted.
- Edge Function `delete-account`: checks the caller, removes progress and
  certificate photos, then deletes the sign-in. Every row goes with it.
- `admin-account` now removes certificate photos too.

## Edge cases
- A delete that fails after the files are gone: the person can try again.
- Nothing to export: the file still has every section, empty.
- A coach deleted with active clients: the links end with the account.

## Out of scope
- Exporting in CSV for other apps (T-045).
- Emails about requests (with T-042a3b).

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 3, 4, 5, 7 | `src/db/dataRequests.test.ts` |
| 2 | `src/account/deleteFunction.test.ts` |
| 1, 2, 5 | `src/account/Account.test.tsx` |
| 6 | `src/admin/Requests.test.tsx` |
