# T-077: Privacy policy

Status: built
Task: [T-077](../tasks/TASKS.md)

## Problem
Play Store and App Store need a privacy policy at a public link. India's
DPDP Act also asks us to tell people what we keep, why, and how to use
their rights. The app had no policy.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. Given anyone, signed in or not, `/privacy.html` shows the policy. It says
   what we keep, why, who sees it, where it is kept, rights, how long we
   keep it, age and contact. It has no scripts.
2. Given the sign-in screen or the Account page, a link opens the policy.
3. Given the app installed on a phone, opening the policy does not replace
   the app's saved offline page.

## Rules and reasons
- The words live in `src/legal/privacy.ts`, so the words test checks them.
- The build writes them into a plain page (`build/privacyPage.ts`).
- It says support may sign in as you to fix a problem (DK, T-042a4).
- The app is for people 18 and over. DPDP needs a parent's consent for
  younger people, which the app does not collect.
- A contact email shows once DK sets `CONTACT_EMAIL`. Until then, people
  use "Ask for a change".

## Data and privacy
- No data changes.

## Edge cases
- The page works with no internet once opened, from its own saved copy.

## Out of scope
- Terms of use.
- The policy in Hindi and Marathi (with the app's languages later).
- Checking age at sign-up (T-042c4 flags sign-ups under 18).

## Tests
| Criterion | Test file |
|---|---|
| 1 | `build/privacyPage.test.ts` |
| 2 | `src/auth/SignIn.test.tsx`, `src/account/Account.test.tsx` |
| 3 | `src/pwa.test.ts` |
