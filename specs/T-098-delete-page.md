# T-098: Public page on deleting an account

Status: built
Task: [T-098](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
Deleting an account worked only inside the app. Google Play asks for a web
link where people can learn how to delete, and ask for it without the app.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. `/delete-account.html` says how to delete in the app and without it,
   and what is removed. It links to the app and the privacy policy. It has
   no scripts, and the privacy page links to it.
2. Like the privacy page, it is not sent to the app and keeps its own copy offline.

## Rules and reasons
- Without the app, people email trackmefit5@gmail.com from the email they
  signed up with, so we know it is their account. We answer within 7 days.
- The words live in `src/legal/deleteAccount.ts`, so the words test checks them.

## Data and privacy
- No migration.

## Tests
- `build/privacyPage.test.ts` "delete account page (T-098)" (1)
- `src/pwa.test.ts` hosting and offline tests (2, extended)
