# T-094: Tell the other side when a coach link ends

Status: built
Task: [T-094](../tasks/TASKS.md)
Found by the user access study (`trackmefit-notes/user-access-study.md`).

## Problem
When a coach ended a link, the client's "Your coach" part just went back
to the code box. When a client stopped sharing, the client dropped off the
coach's list with no word. Neither side knew what happened.

## Acceptance criteria
Each one becomes a test with the same words in its name.

1. The client sees "Kiran Rao ended your coaching on 12 Nov. Your data
   stays yours."
2. The coach sees "Asha stopped sharing on 12 Nov." under "Stopped
   sharing". Links the coach ended are not listed.
3. A link the person ended themselves shows no note.
4. The database keeps who ended a link and when. Nobody can change it.
   Joining again clears it.

## Rules and reasons
- A trigger sets `ended_at` and `ended_by` when a link ends. It is empty
  when the app or an owner ends it; then the note says the link ended.
- `recent_link_ends()` returns the last 30 days for the signed-in person,
  with the other person's name. Ended links hide the other profile, so the
  function reads only the name.

## Data and privacy
- Migration `20261113000000_link_ends.sql`. Old ended links keep empty
  values and show no note. DK runs it in the Supabase SQL editor before
  merging.

## Tests
- `src/coach/YourCoach.test.tsx` "tell the other side when a link ends (T-094)" (1, 3)
- `src/coach/Clients.test.tsx` "tell the other side when a link ends (T-094)" (2)
- `src/db/coach.test.ts` "tell the other side when a link ends (T-094)" (4)
