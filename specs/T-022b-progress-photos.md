# T-022b: Progress photos

Status: agreed (DK, 15 Oct 2026: "go ahead" on the next task in order)
Task: [T-022b](../tasks/TASKS.md)

## Problem
The scale and tape miss changes that a photo shows, like a leaner waist or
bigger shoulders. People want photos from the same angle over weeks, kept
private, without filling up their phone or our storage.

## Acceptance criteria
1. Given the Progress tab, when a person picks a pose (front, side or back)
   and a photo, then it is saved for today and shown under today's date.
2. Given a photo is saved, then it is made smaller first (longest side
   1280 px, JPEG), which also drops hidden details like location.
3. Given a pose already has a photo today, then the app says "You already
   have a front photo for today. Remove it first." and saves nothing.
4. Given a file that is not a picture, or over 15 MB, then the app says so
   and saves nothing.
5. Given a saved photo, when the person taps Remove, then the photo and its
   file are deleted.
6. Given many photos, then the 30 newest show first, with "Show older" for
   the rest.
7. Given the database, then only the person can add or remove their photos,
   only the person and their active coach can see them, and nobody else can
   read a photo file without its record.

## Rules and reasons
- Shown text: "Only you and your coach, if you have one, can see these."
- Tip: "Use the same place, light and pose each time."

## Data and privacy
- Migration `20261026000000_progress_photos.sql`:
  - Table `progress_photos(id, user_id, taken_on, pose, path, created_at)`,
    one photo per pose per day. `path` must start with the owner's id.
  - Private storage bucket `progress-photos`, JPEG or WebP, up to 3 MB.
  - Files live at `<user id>/<photo id>.jpg`. Upload, read and delete in your
    own folder. Anyone else, like a coach, reads a file only through a record
    they can see.
- The app shows photos with signed links that last one hour. Links are
  made in one request per page, not one per photo.
- Photos are never public and never kept in browser storage or the service
  worker cache.

## Edge cases
- Offline or a failed upload: "Couldn’t save the photo. Check your
  connection." Nothing half-saved is left: if the record fails, the file is
  removed.
- Removing: the record goes first, so a failed file delete leaves no photo
  on screen. The file can't be read without its record.
- Phone photos taken sideways keep the right way up.
- Account delete (not built yet) must also delete the person's photo folder.

## Out of scope
- Side-by-side compare of two dates (next step).
- Coach view of photos (comes with the coach dashboard, T-026).
- Photos for other dates than today.

## Tests
| Criterion | Test file |
|---|---|
| 1, 3, 4, 5, 6 | `src/progress/Photos.test.tsx` |
| 2 | `src/progress/photos.test.ts` |
| 7 | `src/db/photos.test.ts` |
