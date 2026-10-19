# T-101b: The Calm Saffron look, light or dark

Status: built. Screen layout changes (calorie ring, bottom tabs) are T-101c.
Task: [T-101b](../tasks/TASKS.md)
DK picked "Calm Clinic" in the Saffron colours from the sample designs (19 Oct 2026).
Research notes: `trackmefit-notes/design-research.md`.

## Problem
The app used plain system fonts and a green that matched no design. It
followed the phone's dark setting, but people could not choose.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The phone setting is used at first.
2. A light or dark choice is saved on the phone and set on the page.
3. Blocked storage falls back to the phone setting.
4. The Account page sets light or dark on this phone.

## Rules and reasons
- Every colour is a CSS token in `src/index.css`. Light and dark only change
  the tokens, so a new screen gets both looks for free.
- `data-theme` on `<html>` beats the phone setting. No `data-theme` means
  "Phone setting".
- The choice is kept on the phone, not the account. It works before sign-in,
  and a shared tablet can differ from a phone.
- The look is set before the app draws, so the page never flashes.
- Saffron `#a14a0c` with white text is about 6:1 contrast. In dark mode, text
  and lines use a lighter saffron `#f2b36b`.
- DM Sans is served from our own site (Fontsource), not Google, so no one
  else sees who opens the app.
- The app icon and phone bar colour moved to saffron too.
