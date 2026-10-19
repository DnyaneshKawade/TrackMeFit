# Work log

Newest first. One entry per finished piece of work: what changed, which tests cover it, and anything left open.

## 2026-10-19: T-096 choose what your coach sees
- Under Your coach, two switches: "Progress photos" and "Health answers". Both start off and save at once.
- The coach sees "Not shared" for parts the client keeps private. An ended link turns both off.
- Health answers moved from `profiles` to a new `health_answers` table, so the database hides them from a coach.
- Migration: `20261116000000_coach_shares.sql` (DK runs it before merging).
- Tests: `src/db/coachShares.test.ts` (3), `src/coach/ClientView.test.tsx` (2), `src/coach/YourCoach.test.tsx` (1); `src/db/rls.test.ts` and `src/profile/profile.test.ts` updated.

## 2026-10-19: Google users add a password (T-091b)
- Account, Sign-in and security: a Google user taps "Add a password". We email a code first, then they type the code and a new password twice.
- Uses Supabase `reauthenticate()` and `updateUser({ password, nonce })`. A wrong or old code says to ask for a new one.
- No migration. Spec: [T-091b](../specs/T-091b-google-password.md).
- Tests: `src/account/Security.test.tsx` "Google users add a password (T-091b)" (3).

## 2026-10-19: T-098 public page on deleting an account
- `/delete-account.html` says how to delete in the app, or by email to trackmefit5@gmail.com, and what is removed.
- The privacy page links to it. It works offline like the privacy page. This is the link Google Play asks for.
- Tests: `build/privacyPage.test.ts` "delete account page (T-098)" (1), `src/pwa.test.ts` (2 extended).

## 2026-10-19: T-103 "I want to coach"
- Adults who aren't coaches see "Coach other people" on the Account page and can ask once.
- The owner sees "Wants to coach" under Requests. "Make coach" makes them a coach, answers and logs it.
- Someone with a coach must end that link first. The new coach goes through the usual check.
- Migration: `20261115000000_coach_requests.sql` (DK runs it before merging, after #101's).
- Tests: `src/db/coachRequests.test.ts` (3), `src/account/Account.test.tsx` (2), `src/admin/Requests.test.tsx` (1).

## 2026-10-19: T-086 one age rule, with a parent's yes
- Everyone answers their date of birth once, before anything else. Under 13 can't go on.
- From 13 to 17, a teen shows a code. A parent types it under Account, with their own adult account, and says yes. They can take it back.
- Until a parent says yes, the database refuses a teen's new data. Teens can't link to a coach. Coaches must be 18.
- Under 18, the engine never suggests eating less.
- Migration: `20261114000000_age_rule.sql` (DK runs it before merging).
- Tests: `src/db/ageRule.test.ts` (4), `src/App.test.tsx` (3), `src/family/FamilyPart.test.tsx` (2), `src/profile/profile.test.ts` (1).

## 2026-10-19: T-089 privacy page contact and rights
- The privacy page shows trackmefit5@gmail.com and says Track Me Fit answers.
- It says how to complain to the Data Protection Board, how to take back consent, and what a coach sees.
- T-097 (support sign-ins in the download) is dropped: DK said no on 19 Oct 2026.
- Tests: `build/privacyPage.test.ts` "privacy contact and rights (T-089)" (2).

## 2026-10-19: T-099 first steps for a new coach
- A new coach sees three steps: fill in your details, we check you, invite a client.
- Each is marked Done, Now or Next, and says what it means for clients.
- An approved coach with no clients sees the steps on the invite step; they go once a client joins.
- Tests: `src/coach/CoachStatus.test.tsx` "first steps for a new coach (T-099)" (3).

## 2026-10-19: Coaches change their own details (T-093)

- Approved coaches now see "Your coach details" under their clients. They can change their name, phone, city, years, link and certificates.
- Saving keeps the status Approved.
- Tests: 1 in `src/coach/CoachStatus.test.tsx`, 1 in `src/db/coachApproval.test.ts`.

## 2026-10-19: Coach codes list (T-095)

- The Clients tab lists codes not used yet, with the day each ends.
- Cancel stops a code, for one sent to the wrong person.
- Tests: 1 in `src/coach/Clients.test.tsx`, 1 in `src/db/coach.test.ts`.

## 2026-10-19: Tell the other side when a coach link ends (T-094)

- A client whose coach ended the link sees "Kiran ended your coaching on 12 Nov. Your data stays yours."
- A coach sees "Asha stopped sharing on 12 Nov." for 30 days.
- The database keeps who ended a link and when. Nobody can change it by hand.
- Migration: `20261113000000_link_ends.sql`.
- Tests: 2 in `src/coach/YourCoach.test.tsx`, 1 in `src/coach/Clients.test.tsx`, 1 in `src/db/coach.test.ts`.

## 2026-10-19: One tidy Account page (T-092)

- The Account page now has five parts in order: Your details, Sign-in and security, Your coach, Your data and privacy, Delete my account.
- "Your coach" shows who sees your data and since when. It links to the Progress tab to join or stop.
- Tests: 2 in `src/account/Account.test.tsx`.

## 2026-10-19: Sign-in and security (T-091)

- The Account page shows your email and how you sign in.
- Change your password: type the old one first. Change your email: we send a link to both.
- Google users see a note to change their password with Google.
- The sign-in screen now loads only when shown, so the main file stays under 140 KB.
- Tests: 3 in `src/account/Security.test.tsx`.

## 2026-10-19: Sign out on all devices (T-090)

- "Sign out" now signs out this phone only. Before, it signed out every device.
- The Account page has "Sign out on all devices", for a lost phone. It asks first.
- Tests: 2 in `src/account/Account.test.tsx`, 1 updated in `src/App.test.tsx`.

## 2026-10-19: Ask before sharing with a coach (T-087)

- Typing a code now shows the coach's name and a list of all they will see, health answers too.
- Nothing is shared until "Share with ...". Cancel keeps the code for later.
- The time of the yes is saved and shown as "Sharing since". Nobody can change it.
- Migration: `20261112000000_coach_consent.sql`.
- Tests: 2 new and 1 updated in `src/coach/YourCoach.test.tsx`, 1 in `src/db/coach.test.ts`.

## 2026-10-19: Choose a new password (T-085)

- The "Forgot password" link now opens "Choose a new password". Before, it only signed the person in.
- Same rule as sign-up. The two boxes must match. "Not now" keeps the old password.
- Tests: 3 in `src/auth/newPassword.test.tsx`.

## 2026-10-19: Ended coach links stay ended (T-088)

- A client could set an ended coach link back to active, with no code. Now a trigger refuses it.
- Joining again with a new code still works. Ending still works.
- Migration: `20261111000000_client_ends_only.sql`.
- Tests: 1 in `src/db/coach.test.ts`.

## 2026-10-19: Account and access study

- Studied sign-in, settings, coach sharing and privacy against Supabase docs, the DPDP Act and Rules, and other apps.
- Found 4 fixes: "Forgot password" never sets a new password, setup allows age 13 against an 18+ policy, coach sharing has no clear yes, and a client can reopen an ended coach link.
- Added T-085 to T-103 (except T-104, merged into T-091) to the to-do list, fixes first.
- Study: `trackmefit-notes/user-access-study.md` (project files).

## 2026-10-19: Your details page (T-084)

- "Your details" now opens a page with the sign-up answers, part by part.
- Each part has a Change button that opens that step. Saving comes back to the page.
- "Suggest targets and meals" gives new suggestions at any time. Nothing changes until accepted.
- Coaches see "About this client" with the client's answers, read only.
- Tests: 2 in `src/profile/summary.test.ts`, 2 in `src/coach/ClientView.test.tsx`, 1 new and 3 updated in `src/App.test.tsx`.

## 2026-10-19: Stretch moves (T-082i)

- 49 built-in moves are tagged as training the muscle when it is stretched.
- Starter plans now start with seated leg curls, overhead triceps moves and incline curls.
- Swap ideas pick a stretch move first, with the same kit when there is one.
- A plan reason says why. The edge is small, so it is a preference only.
- Tests: 4 in `src/training/stretch.test.ts`, 1 updated in `src/training/starterPlan.test.ts`.

## 2026-10-19: Plateau check (T-082e)

- Each exercise checks its last sessions for a plateau: 3 in a row with no new best.
- A missed target gives one lighter session, 10% off.
- Few sets for the muscle says to add a set. Otherwise it names a similar exercise for the next block.
- Each exercise now reads its last 6 sessions.
- Tests: 5 in `src/engine/plateau.test.ts`, 1 in `src/training/Workouts.test.tsx`.

## 2026-10-19: Back after a break (T-082f)

- After 10 or more days off an exercise, the suggested weight starts lighter.
- 10 to 20 days: 10% lighter. 21 to 42 days: 20%. 43 or more: 30%.
- Reps stay as last time, inside the range. The reason says how many days off.
- The light week choice moved to its own task, T-082n.
- Tests: 5 in `src/engine/afterBreak.test.ts`, 1 in `src/training/Workouts.test.tsx`.

## 2026-10-19: Weekly sets per muscle (T-082d)

- The plan editor shows "Sets each week": each trained muscle with its sets, most first.
- Each muscle reads low, good, high or too many, against the engine's limits, with the range to aim for.
- Helper muscles count as half a set. The list changes as you change sets.
- Tests: 3 in `src/engine/volume.test.ts`, 1 in `src/training/Workouts.test.tsx`.

## 2026-10-19: Warm-up sets (T-082c)

- Each exercise shows warm-up sets before the first working set, as buttons.
- Big lifts build up: the bar, then 50, 70 and 85% of the working weight, rounded to plates.
- A muscle already trained today gets one set, or none for a small move.
- Tapping a warm-up fills the set and tags it. After logging it, the working weight comes back.
- Tests: 5 in `src/engine/warmup.test.ts`, 1 in `src/training/Workouts.test.tsx`.

## 2026-10-18: Weight steps from reps left (T-082b)

- The next weight now uses the reps left you log, not just the reps you did.
- 2 or more reps left above the week's aim: the weight goes up now, and the reason says why.
- Fewer reps left than the aim: same weight and reps next time.
- With no reps left logged, nothing changes. With no plan, the aim is 2.
- Tests: 5 in `src/engine/repsLeft.test.ts`.

## 2026-10-18: Four more muscles (T-082a)

- Research for T-082 is in `trackmefit-notes/training-research.md`: RP Strength, other apps and the studies. It split T-082 into T-082a to T-082m.
- New muscles: front delts, forearms, inner thighs and neck. Each starts at 0 sets, so no plan adds them on its own.
- Front raises now count for front delts, not side delts. Shoulder presses give front delts half sets.
- 30 new moves, like wrist curls, the hip adduction machine and neck work. The list has 437.
- Migration `20261110000000_more_muscles.sql` widens the muscle checks.
- Tests: 4 in `src/training/moreMuscles.test.ts`, 1 in `src/db/moreMuscles.test.ts`.

## 2026-10-18: 409 gym exercises (T-081)

- The exercise list grew from 71 to 409, in `src/training/exerciseLibrary.ts`.
- Every muscle has at least 10 moves, with more than one kind of equipment.
- Search knows gym names like "stiff leg", "EZ bar", "pec fly", "preacher" and "hip thrust".
- Old ids stay the same, so past sets and plans still work.
- The list loads with the Training tab, not at start. The main file stayed at 139.2 KB.
- Forearm, neck and inner thigh moves wait for T-082, when the engine counts those muscles.
- Tests: 4 in `src/training/exerciseLibrary.test.ts`. Older tests now use names not in the list.

## 2026-10-18: Coach meal plans (T-078)

- The client page has a Meal plan part: size, who set it and when, and "Change meal plan" or "Make a meal plan".
- The coach uses the client's own editor, with the client's food rules, targets and weight.
- The client's Food tab says "Changed by your coach" on a plan the coach saved.
- No migration: the database already let the active, approved coach save, and records who saved.
- Tests: 3 in `src/coach/ClientMealPlan.test.tsx`, 1 in `src/log/TodayPlan.test.tsx`, 1 in `src/db/coach.test.ts`.
- New tasks: T-080 (coach makes an exercise), T-081 (400–500 exercises) and T-082 (training research and engine), as DK asked.

## 2026-10-18: Privacy policy (T-077)

- New page `/privacy.html`, made by the build from the words in `src/legal/privacy.ts`. It needs no sign-in.
- It covers what we keep, why, who sees it, where, your rights, how long, age and contact.
- It says support may sign in as you to fix a problem, as decided for T-042a4.
- Links on the sign-in and sign-up screens and on the Account page.
- The service worker now keeps plain pages apart, so the app's offline page stays the app.
- Tests: 2 in `build/privacyPage.test.ts`, 1 in `src/auth/SignIn.test.tsx`, 1 in `src/account/Account.test.tsx`, 1 in `src/pwa.test.ts`.
- DK: pick a contact email for `CONTACT_EMAIL`. Use `https://<your site>/privacy.html` in both store forms.

## 2026-10-18: Open button for clients (T-079)

- Each client on the Clients tab has a green "Open" button, with a line that says what it is for.
- DK had not seen that the client's name was a button.
- Tests: 1 in `src/coach/ClientView.test.tsx`.

## 2026-10-18: Data requests (T-042a5)

- New migration `20261109000000_data_requests.sql`: `data_requests`, `export_my_data`, `prepare_delete_me`, `admin_requests` and `admin_close_request`.
- Fixed: deleting a coach failed when they had set a client's targets, plans or replies. Those rows now stay with the client, with no coach name.
- New Account page from the top bar: download all my data, ask for a change, and delete my account.
- New Edge Function `delete-account`: checks the caller, removes their photos, then the sign-in. Admins must be removed as admin first.
- `admin-account` now removes a coach's certificate photos too.
- New Requests page for owners: open requests oldest first, days left out of 90, closed with an answer that is logged.
- The admin log keeps who an admin acted on, even after that account is deleted.
- Tests: 5 in `src/db/dataRequests.test.ts`, 4 in `src/account/deleteFunction.test.ts`, 4 in `src/account/Account.test.tsx`, 2 in `src/admin/Requests.test.tsx`.
- New tasks: T-078 (coach meal plans) and T-079 (clearer Open button for clients).
- DK: run the migration, deploy `delete-account`, and redeploy `admin-account`.

## 2026-10-18: View as a person (T-042a4)

- New migration `20261108000000_view_as.sql`: `view_sessions`, `admin_start_view` and `admin_end_view`.
- New Edge Function `admin-view`: the database checks and logs first, then it makes a one-time sign-in for the person.
- The People page has "View as them". The owner is signed in as the person with full access, as DK decided.
- An orange bar and frame show during a view. Exit, or 30 minutes with no activity, signs the owner back in.
- Admins, your own account and unconfirmed accounts can't be viewed.
- Tests: 3 in `src/db/viewAs.test.ts`, 1 in `src/admin/viewFunction.test.ts`, 5 in `src/admin/ViewBar.test.tsx`.
- DK: run the migration and deploy `admin-view`. The privacy policy (T-077) must say support may sign in.

## 2026-10-18: Coach approval (T-042a3)

- New migration `20261107000000_coach_approval.sql`: coach statuses, the Coach approval switch, coach details and certificate photos, owner functions.
- The switch starts off, so new coaches start Approved as today. Coaches working now stay Approved when it turns on.
- Only an Approved coach makes codes, takes clients, reads or changes client data, or chats. The database checks it.
- Coaches who are not Approved see their status, the owner's note, and a details form on the Clients tab.
- A paused coach's clients are told, and keep all their own data.
- Owners get a Coaches page: lists by status (Waiting oldest first), details with photos, decisions, client limit and the switch. Each writes one log row.
- Tests: 9 in `src/db/coachApproval.test.ts`, 5 in `src/coach/CoachStatus.test.tsx`, 3 in `src/admin/Coaches.test.tsx`.
- Left open: the email at each decision (T-042a3b) needs an email service.
- DK: run the migration before merging.

## 2026-10-18: People page (T-042a2)

- New migration `20261106000000_admin_people.sql`: search people, account actions, end a coach link, change role.
- New Edge Function `admin-account` for block, unblock, delete and the confirm email. The service key stays on the server.
- The database checks the owner and the second step and writes the log row first. Only then does the function act.
- Admins can't be blocked or deleted. A coach with clients can't lose the coach role.
- The People page lists account facts only, 50 at a time, with search and Show more.
- Tests: 5 in `src/db/admin.test.ts`, 4 in `src/admin/accountFunction.test.ts`, 4 in `src/admin/People.test.tsx`.
- DK: run the migration and deploy the function before using the page.

## 2026-10-18: Admin access (T-042a1)

- New migration `20261105000000_admin_access.sql`: `user_roles` (content, owner), `is_admin()`, `admin_log`, and team functions.
- Every admin rule needs the second step (a code app, Supabase TOTP). A stolen password alone does nothing.
- Every admin action writes one log row with a reason. Triggers stop anyone changing or deleting the log.
- There must always be one owner, so nobody locks everyone out.
- The Admin tab shows only for admins. It sets up the code app, then asks for a code each sign-in.
- Owners get the Admin team page: add, change and remove admins.
- DK adds the first owner once in the SQL editor (line at the top of the migration).
- Tests: 7 in `src/db/admin.test.ts`, 5 in `src/admin/Admin.test.tsx`.
- Next: People page and the account Edge Function (T-042a2).

## 2026-10-18: New plan foods (T-068a2)

- Added besan, sattu, hung curd, skimmed milk, skimmed milk powder and low-fat paneer to the meal plan.
- New protein picks: low-fat paneer, hung curd and skimmed milk, besan and sattu.
- Low-fat paneer uses the Amul High Protein Paneer label from amul.com: 170 kcal, 25 g protein, 4 g carbs, 6 g fat.
- Ingredients can now carry label values directly, marked as a label source.
- No sattu label was found online. It uses USDA raw chickpeas until DK sends a pack photo.
- Hung curd uses USDA low-fat Greek yogurt.
- Foods of one kind (milk and skimmed milk) are not added to one meal together.
- Tests: 4 new in `src/engine/mealPlan.test.ts`, 1 new in `src/food/indian/resolve.test.ts`, 1 updated in `src/profile/planFoods.test.ts`.
- Open: check the Amul pack by hand; a sattu label photo.

## 2026-10-17: Picks first, then other foods (T-068e)

- DK: use the person's picks first; if they are not enough, use any other food.
- When picks can't reach the protein target, the plan now adds other allowed protein foods, leanest first.
- Whey is never added unless the person picked it.
- Each added food says why, and a note names them. Suggestions no longer list foods already in the plan.
- Veg-day swaps go: picks, then paneer, toor dal, soya and tofu, then any other allowed protein food.
- Tests: 1 rewritten and 1 new in `src/engine/mealPlan.test.ts`.

## 2026-10-17: Weekly check (T-067d)

- Last of the five diet engine parts. Spec `specs/T-067d-weekly-check.md`.
- Before each step, the app looks at the average weight over the last 14 days.
- If weight already falls at the chosen pace, the Food tab says to stay for now. "OK" hides it for a week.
- After 21 days of weigh-ins and 14 days of food logs, it learns the real burn. The goal level moves with it, within the same caps and floors.
- One range query reads the last 21 days of food. No tables change.
- Tests: 5 in `src/engine/steps.test.ts`, 1 in `src/profile/profile.test.ts`, 1 in `src/targets/TargetsFood.test.tsx`.

## 2026-10-17: How your plan works (T-076)

- Spec `specs/T-076-how-your-plan-works.md`. Unparked from the later list, as agreed with DK.
- Setup now shows three short cards under the suggested targets, one at a time.
- They say why week 1 is not a cut, why fried food and sweets stay out, and why early loss is mostly water.
- Plans with no weekly steps show only the clean food card.
- Tests: 3 in `src/profile/HowPlanWorks.test.tsx`, 1 in `src/profile/Onboarding.test.tsx`.

## 2026-10-17: Clean meal plan (T-068b)

- Fourth of the five diet engine parts. Spec `specs/T-068b-clean-meal-plan.md`.
- Each main meal now has one cereal base (roti, rice, oats or sooji). Lunch can have roti and rice.
- At most one dal per meal. Dinner uses a different protein food from lunch.
- Amounts come in whole steps: 1 roti, ½ katori rice, 1 egg, 1 katori curd. No more 15 g of rice.
- The usual day sets which foods are used, not how much. Sugar goes only with milk.
- Big calorie targets add rice at dinner, then oil up to ICMR's level, then curd, milk or peanuts as a snack.
- "Close enough" is now 8 % of calories, since a whole roti is about 100 kcal.
- Atta goes up to 240 g a day and oil to 15 g a meal for big targets.
- The plan screen says fried snacks, sweets and cold drinks stay out.
- T-068a units are folded in. New foods (besan, sattu, low-fat paneer and others) moved to T-068a2.
- Tests: 9 new in `src/engine/mealPlan.test.ts`, 1 in `src/profile/Onboarding.test.tsx`, and updated plan tests.

## 2026-10-17: Protein, carbs, fat and fibre (T-068c)

- Third of the five diet engine parts. Spec `specs/T-068c-protein-carbs-fat-fibre.md`.
- Protein is 1.4 g per kg from day 1, down from 1.6. From BMI 25 it uses the weight at BMI 25.
- Carbs never drop below 130 g and 40 % of calories. Fat goes down first, then protein, to 1.2 g/kg at least.
- The plan now shows a fibre goal: 14 g per 1,000 kcal, at least 25 g.
- The old protein and macro helpers in `src/engine/diet.ts` were replaced by `src/engine/nutrients.ts`.
- Tests: 5 in `src/engine/nutrients.test.ts`, 1 in `src/profile/profile.test.ts`.

## 2026-10-17: Calorie steps (T-067a)

- Second of the five diet engine parts. Spec `specs/T-067a-calorie-steps.md`.
- Losing weight now starts at the app's own burn number, not with the full cut on day 1.
- Calories go down 250 kcal a week to the goal level. The cut is capped at 25 % of the burn and 750 kcal.
- Setup shows each week's calories. After 7 days, the Food tab offers the next step; it changes only on "Use it".
- No migration: each step is a new suggested target.
- Tests: 5 in `src/engine/steps.test.ts`, 2 in `src/profile/profile.test.ts`, 1 in `src/profile/Onboarding.test.tsx`, 2 in `src/targets/TargetsFood.test.tsx`.

## 2026-10-17: Simpler words (T-075)

- DK asked for words a 5th grader can follow. Spec `specs/T-075-simpler-words.md`.
- Sentences are now 12 words or fewer, down from 20. About 55 messages were split or reworded.
- A new check keeps each file at school grade 5 or lower. Thirteen more hard words are banned.
- "Typical day" is now "usual day". `docs/words.md` has the new rules.
- DK agreed to every pick in the plan's open questions, and cut the diet build to five parts.
- Tests: 3 in `src/words.test.ts`, plus updated wording in the tests that check messages.

## 2026-10-17: Safe paces (T-071)

- First step of the new diet engine plan, after DK's diet feedback. Spec `specs/T-071-safe-paces.md`.
- Underweight people aren't offered "Lose", and see why. Below BMI 17 no targets are suggested; the app asks them to see a doctor.
- "Faster" loss shows only from BMI 25. A saved pace is kept within 1%, 0.75% or 0.5% of weight a week, by BMI.
- Added the diet engine plan to the To do list.
- Tests: 3 in `src/profile/profile.test.ts`, 1 in `src/profile/Onboarding.test.tsx`.

## 2026-10-15: Change your details (T-070)

- DK asked that sign-up answers can be changed at any time. Spec `specs/T-070-your-details.md`.
- "Your details" at the top opens the setup steps with the person's answers and latest weight filled in.
- "Save and close" saves on any step and keeps the targets. The last step offers new targets, used only on "Use these targets".
- A changed weight is saved as today's weigh-in; an unchanged one adds nothing. "Cancel" changes nothing.
- Next: the stronger diet engine, with plans that change week by week.
- Tests: 3 in `src/App.test.tsx`.

## 2026-10-15: Client limit per coach (T-026i)

- Last part of the coach dashboard (T-026), which is now done. Spec `specs/T-026i-client-limit.md`.
- Each coach can have up to 30 active clients for now. The admin pages (T-042) will change it per coach.
- A full coach can't make a new code. A code made earlier says the coach is full, and it still works once there is room.
- The Clients tab shows "Your clients (12 of 30)". Nobody can change their own limit.
- Migration `20261104000000_client_limit.sql`: `profiles.client_limit`, a guard trigger, `coach_has_room`, a check on new codes, and `join_coach` checks the limit.
- Tests: 1 in `src/db/coach.test.ts`, 1 in `src/coach/Clients.test.tsx`, 1 in `src/coach/YourCoach.test.tsx`.

## 2026-10-15: Weekly check-ins and side-by-side photos (T-026e)

- Fifth part of the coach dashboard (T-026), next in order. Spec `specs/T-026e-check-ins.md`.
- A person with a coach sends a weekly check-in from Progress: five scores from 1 to 5 and two notes. They can change it until the coach replies.
- The client page shows check-ins newest first, with the week's average weight and the change from the week before. The coach replies once.
- "Compare two dates" shows two photos of one pose side by side, for the person and the coach.
- Migration `20261031000000_check_ins.sql`: table `check_ins` with column-level grants, and `reply_check_in` for the coach.
- Also removed four task rows that the #55 merge had doubled.
- Left for T-026: chat, templates and a client limit.
- Tests: 3 in `src/coach/YourCoach.test.tsx`, 1 in `src/coach/ClientView.test.tsx`, 3 in `src/coach/checkIns.test.ts`, 1 in `src/progress/Photos.test.tsx`, 1 in `src/db/coach.test.ts`.

## 2026-10-15: Live chat (T-026h)

- DK asked whether chat is real time, like SignalR. Spec `specs/T-026h-live-chat.md`.
- An open chat now gets new messages and "Seen" at once through Supabase Realtime. Realtime uses the same privacy rules.
- Migration `20261103000000_live_chat.sql`: adds `chat_messages` to the `supabase_realtime` publication.
- Tests: 1 in `src/db/coach.test.ts`, 2 in `src/coach/Chat.test.tsx`.

## 2026-10-15: Program templates (T-026g)

- Next part of the coach dashboard (T-026). Spec `specs/T-026g-program-templates.md`.
- The Clients tab has "Program templates". The coach makes and edits them with the plan editor.
- On a client page, "+ Start a program" copies a template into the client's plans. The coach picks the start week, so a client can join a group partway.
- The coach's own exercises are left out of the copy, with a note, because the client can't see them.
- Migration `20261102000000_program_templates.sql`: column `workout_plans.is_template`; only coaches keep templates.
- Left for T-026: a client limit. Live chat updates come next, as DK asked.
- Tests: 1 in `src/db/coach.test.ts`, 2 in `src/coach/ClientView.test.tsx`, 2 in `src/coach/templates.test.ts`.

## 2026-10-15: Chat with the coach (T-026f)

- Next part of the coach dashboard (T-026). Spec `specs/T-026f-chat.md`.
- The person chats under "Your coach" on Progress. The coach chats on the client page.
- The Clients list shows "1 new message" for clients who wrote. "Seen" shows once the other side opens the chat.
- The latest 30 messages load first; "Show earlier messages" loads 30 more.
- The app has no alerts yet, so after sending it offers "Tell … on WhatsApp" with the message.
- Migration `20261101000000_chat.sql`: table `chat_messages`, functions `in_link` and `mark_chat_read`. A chat belongs to one coach link and closes when the link ends.
- Left for T-026: program templates and a client limit.
- Tests: 1 in `src/db/coach.test.ts`, 3 in `src/coach/Chat.test.tsx`, 1 in `src/coach/ClientView.test.tsx`.

## 2026-10-15: Email limit message (T-066b)

- DK then saw "Too many tries. Please wait a minute". Supabase's built-in email sender allows about 2 emails an hour.
- That error now says too many emails were sent this hour, and suggests Google. Other limits still say to wait a minute.
- Tests: 1 in `src/auth/SignIn.test.tsx`.

## 2026-10-15: Clear sign-up errors (T-066b)

- DK saw "Something went wrong" when creating an account, for both roles. Spec `specs/T-066b-sign-up-errors.md`.
- The likely cause is Supabase's built-in email sender, which only sends to team members. The fix there is an email sender (SMTP) in the dashboard.
- The sign-up screen now says when the email couldn't be sent or the account couldn't be set up. Unknown errors show their code.
- Tests: 2 in `src/auth/SignIn.test.tsx`.

## 2026-10-15: Coaches sign up with Google (T-066), admin tasks split up

- DK asked for Google sign-in for coaches. Spec `specs/T-066-google-coach.md`.
- "Continue with Google" now shows for coaches too. A new Google account answers one question first: "Tracking my own fitness" or "A coach".
- Migration `20261030000000_choose_role.sql`: `profiles.role_chosen` and `choose_role`, which sets the role once. Direct role changes are still refused.
- Google accounts made before this stay regular accounts; the admin People page will move them.
- `tasks/TASKS.md`: admin work split into T-042a1 to a5 and T-042c1 to c5, from the updated admin plan. Coach approval stays off until the switch is built.
- Tests: 4 in `src/auth/SignIn.test.tsx` (1 replaced), 1 in `src/db/rls.test.ts`.
## 2026-10-15: A coach edits a client's workout plan (T-026d)

- Fourth part of the coach dashboard (T-026), next in order. Spec `specs/T-026d-coach-plans.md`.
- The client page lists the client's plans with their days, and who changed each one last.
- "Edit" and "+ New plan" open the plan editor for the client. The coach can't delete a client's plan.
- While the page is open, the client's own exercises are known by name and can be picked. The coach's own come back after.
- The client sees "Changed by your coach on 15 Oct." under a plan on the Training tab.
- Migration `20261029000000_plan_changed_by.sql`: `workout_plans` gets `updated_by` and `updated_at`, filled by a trigger. It also fixes `created_by` to the signed-in person.
- Left for T-026: check-ins, chat, templates and a client limit.
- Tests: 4 in `src/coach/ClientView.test.tsx`, 1 in `src/training/Workouts.test.tsx`, 1 in `src/db/coach.test.ts`, 1 check in `src/training/training.test.ts`.

## 2026-10-15: Open a client (T-026c)

- Third part of the coach dashboard (T-026), next in order. Spec `specs/T-026c-open-client.md`.
- On the Clients tab, tapping a name opens that client's page. It shows what needs attention, daily targets, weight and the weight chart.
- It also shows food stats, workouts in the last 4 weeks and progress photos. The coach can only look at photos.
- "Change targets" lets the coach set the client's targets from today. Targets say who set them.
- No database change: the page uses the client's stores with the client's id, and the existing privacy rules allow it.
- Left for T-026: editing a client's workout plan here, check-ins, chat, templates and a client limit.
- Tests: 4 in `src/coach/ClientView.test.tsx`.

## 2026-10-15: Clients sorted by who needs attention (T-026b)

- Second part of the coach dashboard (T-026), next in order. Spec `specs/T-026b-client-attention.md`.
- The Clients tab now puts the clients who need help first. Each shows plain reasons, or "On track this week."
- Reasons: no food or weigh-in for some days, missed workouts, calories or protein off target, and weight moving against the goal or too fast.
- The rules are a pure engine, `src/engine/attention.ts`, with a weight per flag.
- Migration `supabase/migrations/20261028000000_client_summaries.sql` adds `client_summaries(today)`. It must be run in Supabase. It counts last week per client in one request, with the coach's own rights.
- Left for T-026: opening a client's screens, check-ins, chat, templates and a client limit.
- Tests: 5 in `src/engine/attention.test.ts`, 1 new and 1 changed in `src/coach/Clients.test.tsx`, 1 in `src/db/coach.test.ts`.

## 2026-10-15: Connect a coach and a client (T-026a)

- Next task in order, the first part of the coach dashboard (T-026). Spec `specs/T-026a-coach-connect.md`.
- Coaches get a Clients tab. "Invite a client" makes a code that works once for 7 days, with "Share on WhatsApp" and "Copy code".
- People enter the code under "Your coach" on the Progress tab. They then see their coach's name and what the coach can see.
- A code is used instead of searching by email, so nobody can find out who uses the app.
- One coach at a time: joining a new coach ends the old link. Either side can end the link after a confirm.
- Migration `supabase/migrations/20261027000000_coach_invites.sql` adds `coach_invites` and the `join_coach` function. It must be run in Supabase.
- Left for T-026: clients sorted by who needs attention, opening a client's data, check-ins, chat, templates and a client limit.
- Tests: 2 in `src/db/coach.test.ts`, 3 in `src/coach/YourCoach.test.tsx`, 2 in `src/coach/Clients.test.tsx`, 1 in `src/auth/SignIn.test.tsx`.

## 2026-10-15: Progress photos (T-022b)

- Next task in order; DK said "go ahead". Spec `specs/T-022b-progress-photos.md`.
- The Progress tab has a "Progress photos" section. Pick Front, Side or Back, then add today's photo.
- Photos are made smaller on the phone before upload: 1280 px on the longest side, JPEG. Redrawing drops hidden details like location.
- Photos show by date, newest first, 30 at a time with "Show older". Each can be removed. One photo per pose per day.
- Migration `supabase/migrations/20261026000000_progress_photos.sql` adds the `progress_photos` table and a private storage bucket with its rules. It must be run in Supabase.
- Only the person adds or removes photos. The person and their active coach can see them. Others can't read a file without its record.
- Left: side-by-side compare of two dates, coach view (T-026), and deleting the photo folder when account delete is built.
- Tests: 4 in `src/progress/photoStore.test.ts`, 5 in `src/progress/Photos.test.tsx`, 1 in `src/db/photos.test.ts`.

## 2026-10-15: Fasting days rolled back (T-041c)

- DK said most people eat a good amount when fasting and only avoid some foods. Marking the day is too much for now.
- Removed "Fasting today?" from the food log, the fasting parts of food stats and the dashed bars. The code is the same as before #48.
- Migration `supabase/migrations/20261025000000_drop_fasting_days.sql` drops the `fasting_days` table. It must be run in Supabase.
- T-041c is back in To do with its spec. The calorie-spreading draft stays on branch `feat/fasting-spread`.
- Tests: the 7 tests added in #48 are removed with the code; all other tests unchanged.

## 2026-10-15: Fasting days in the food log (T-041c)

- Last part of T-041. DK got a choice card; "Mark the day" was recommended and built. Spec `specs/T-041c-fasting-days.md`.
- People who fast see "Fasting today?" in the food log. A marked day keeps its targets but is left out of food averages and days on target, and doesn't break the protein streak.
- Food stats show fasting days with a dashed bar and a note.
- Migration `supabase/migrations/20261024000000_fasting_days.sql` adds the `fasting_days` table with row-level security. It must be run in Supabase.
- Left: spreading missed calories over the week (opt-in, with T-047 or T-048), and festival calendars.
- Tests: 2 in `src/engine/dietStats.test.ts`, 3 in `src/log/FoodLog.test.tsx`, 1 in `src/progress/DietStats.test.tsx`, 1 in `src/db/rls.test.ts`.

## 2026-10-15: Event date for the goal (T-041b)

- Next part of T-041, by the order of tasks. Spec `specs/T-041b-event-date.md`.
- The goal step has an optional "Event date", like a wedding or trip. It says if the target weight comes before the date. If not, it says the weight on the day and the weekly pace the target would need.
- It never changes the pace or targets, since diet targets are set by the person or coach. "Your plan" shows the same note.
- Migration `supabase/migrations/20261023000000_event_date.sql` adds `profiles.event_date`. It must be run in Supabase.
- Left: fasting days as flexible days (rest of T-041), and changing the date after signup (no profile edit screen yet).
- Tests: 5 in `src/profile/profile.test.ts`, 1 new and 1 changed in `src/profile/Onboarding.test.tsx`, 1 in `src/db/rls.test.ts`.

## 2026-10-15: Suggested workout plan (T-041a)

- DK asked if we will give RP-style plans made from the person's details, then said to go by the order of tasks. Spec `specs/T-041a-suggested-plan.md`.
- "Suggest a plan" on the Training tab starts from the onboarding answers: workouts a week, lifting experience and where you train. Each can be changed.
- The split follows workouts a week: full body for 2 or 3, upper and lower for 4, upper, lower, push, pull, legs for 5, push, pull, legs twice for 6. Each muscle is trained about twice a week.
- Exercises fit the equipment: home uses dumbbells, body weight and kettlebells; no equipment uses body weight only. Sets per muscle start from the engine's `startingSets`, 2 to 4 per exercise.
- "Use this plan" opens the plan editor, so the person can change anything. Nothing is saved until "Save plan".
- Added 8 exercises for home and no-equipment plans, such as body-weight squat, inverted row and glute bridge.
- Not done: a step at the end of signup. People with no plan see a pointer to "Suggest a plan" instead.
- Tests: 6 in `src/training/starterPlan.test.ts`, 3 in `src/training/Workouts.test.tsx`.

## 2026-10-15: "New record" during a workout (T-044b)

- DK said to go by the logical order of tasks. T-044b follows Records and progress (T-044). Spec `specs/T-044b-new-record.md`.
- When a working set beats your best, a note shows under the exercise, for example "New record: heaviest weight. Your best before was 70 kg."
- Order: heaviest weight, then best estimated one-rep max, then most reps for exercises with no weight. Sets done earlier today count, so a tie shows nothing.
- No note for warm-ups, drop sets, or the first workout with an exercise. Removing the record set removes its note. Offline, no note shows and the set still saves.
- Uses the same history query as Records and progress, once per exercise. Nothing new is stored.
- Tests: 5 in `src/engine/strength.test.ts`, 4 in `src/training/Records.test.tsx`.

## 2026-10-15: Every food shows in search (T-065)

- DK said a veg, eggetarian or Jain person shouldn't have chicken, fish or onion hidden from search: "let them see all of it". People sometimes eat outside their diet, and a hidden food looks like a missing one.
- The diet filter is gone from "Change plan > Add a food" and the usual day's "Add another food". Logging what you ate already showed every food.
- Kept: meal plans the app makes, Swap choices and the usual day's everyday rows still follow the diet, since those are the app choosing for the person. A food added by hand stays in the plan; on a non-veg-free day it is still swapped.
- Specs `specs/T-057-diet-rules.md` (criterion 8) and `specs/T-061-change-plan.md` (criteria 7, 8) updated.
- Tests: 1 new in `src/log/PlanEditor.test.tsx`, 1 changed in `src/profile/Onboarding.test.tsx`.
## 2026-10-15: Edit and remove your own exercises (T-043c)

- DK asked to add exercises that aren't listed, and to compare FitNotes and RP Hypertrophy. Adding was in T-043b; DK said "lets proceed" on editing and removing. Spec `specs/T-043-workout-logger.md`, criteria 14 to 16.
- Your own exercises have "Edit" in the exercise list. It changes the name, main muscle, equipment and one-joint flag, with the same checks as a new exercise. Keeping the same name is fine.
- "Remove from my list" hides the exercise, with "Undo". Past sets, records and plans keep it. FitNotes deletes the history instead; we don't, so a mistake never loses training.
- Migration `supabase/migrations/20261022000000_hide_own_exercises.sql` adds `custom_exercises.hidden`. It must be run in Supabase. The "write own" policy already covers edits.
- Left for later (from the FitNotes comparison): rest time, weight step and notes for each exercise, and timed or distance exercises.
- Tests: 4 in `src/training/Workouts.test.tsx`, 3 in `src/training/training.test.ts`, 1 in `src/db/rls.test.ts`.

## 2026-10-13: Records and strength graphs (T-044)

- DK said to go ahead with the suggested next task. Spec `specs/T-044-records.md`.
- "Records and progress" on the Training tab has a calendar by month. Days trained are marked, and tapping one lists its workouts.
- "Your exercises" lists every exercise done in the last year. Each one shows the heaviest weight, best estimated one-rep max, most reps, and heaviest for 1, 2, 3, 5, 8, 10 and 12 reps, with dates.
- A graph shows the best estimated one-rep max of each workout. For no-weight exercises it shows the most reps.
- The one-rep max uses the Epley formula from sets of 12 reps or fewer. Warm-ups and drop sets are left out.
- Plate calculator with Indian gym plates (25 to 1.25 kg) and a 20, 15 or 10 kg bar. Weights that can't be loaded round down. Barbell exercises in a workout show the plates for each side.
- Engine: `src/engine/strength.ts` and `src/engine/plates.ts`, pure, with reasons. Data: `summaries` (one range query) and `exerciseHistory` (up to 200 workouts) on the workout stores. Offline, the calendar uses the days kept on the phone; records need a connection.
- Migration `supabase/migrations/20261021000000_workout_indexes.sql` adds the missing indexes on `workout_sessions (user_id, performed_on)` and `set_logs`. It must be run in Supabase.
- Left for T-044b: a "New record" note during a workout.
- Tests: 7 in `src/engine/strength.test.ts`, 4 in `src/engine/plates.test.ts`, 2 in `src/training/calendar.test.ts`, 9 in `src/training/Records.test.tsx`, 2 in `src/training/training.test.ts`, 1 in `src/training/offlineStore.test.ts`, 1 in `src/db/rls.test.ts`.

## 2026-10-13: Workout logger, part 2 (T-043b)

- DK said yes to T-043b. Spec `specs/T-043-workout-logger.md`, criteria 9 to 13.
- Supersets: in the plan editor and in a session, "Superset with next" links an exercise to the one after it. Plans save the link.
- In a superset there is no rest between exercises. A "Now do X" note shows the next one. After the last exercise of the group, the longest rest of the group starts.
- Favourites: a star on each exercise in the picker. Favourites show first under "Favourites".
- Own exercises: "+ New exercise" (or "Add … as a new exercise" when nothing matches) asks for a name, main muscle, equipment and whether it works one joint. Names are checked for blanks, length and repeats.
- Data: migration `supabase/migrations/20261020000000_exercise_library.sql` adds equipment and one-joint columns to `custom_exercises`, a `favourite_exercises` table with row-level security, and `plan_exercises.superset_next`. It must be run in Supabase. Main bundle 128.7 KB. Own exercises and favourites are saved online only; logging sets still works offline.
- Tests: 6 in `src/training/Workouts.test.tsx`, 4 in `src/training/training.test.ts`, 1 in `src/training/restTimer.test.ts`, 2 in `src/db/rls.test.ts`.

## 2026-10-13: Food stats (T-062)

- DK said to go ahead with T-062 after T-061b. Spec `specs/T-062-diet-stats.md`.
- Progress has a new "Food stats" part with "7 days" and "30 days". It shows average calories, protein, carbs and fat per logged day, each next to the target, and how many logged days were on target (calories within 10%).
- It also shows the protein streak (days in a row with at least 90% of the protein target), a calorie chart with the target as a line, and the five foods logged most often.
- Today is left out of averages until it is over, and days with nothing logged are left out too. Each day is compared with the target in force that day. Quick adds count for calories but not for "most logged".
- Engine: `dietStats` in `src/engine/dietStats.ts`, pure, one pass over the entries with a `Map` per day and per food.
- Data: `LogStore.listRange` reads 30 days in one query on the `food_logs_user_day` index; `TargetStore.history` reads the targets once. Offline, the stats use the days kept on the phone. No database change. Progress chunk 4.7 KB; main bundle 128.2 KB.
- Tests: 6 in `src/engine/dietStats.test.ts`, 4 in `src/progress/DietStats.test.tsx`, 1 in `src/progress/Progress.test.tsx`, 1 in `src/log/offlineStore.test.ts`.

## 2026-10-13: Full food search in the plan and usual day (T-061b)

- DK asked why "Change plan > Add a food" offered only a short list, and why the usual day's "Add another food" didn't open the search page. Spec `specs/T-061-change-plan.md`, criteria 7 and 8.
- "+ Add a food" in the plan editor now opens the same Add food page as the meals: search every food, pick an amount, or make a new food. No quick add, since a plan needs a food. The food can be changed in amount or removed. Adding the same food again adds to it.
- Searched foods keep their diet tags, so a non-veg dish added this way is swapped out on a veg day.
- "+ Add another food" at signup opens the same page, with amounts and quick add. "Enter it yourself" stays.
- The Add food page can hide foods the diet leaves out (`excluded`); both places use it.
- Engine: `addFoundItem` in `src/engine/mealPlan.ts`; `setItemGrams` scales searched foods by weight.
- Tests: 1 new in `src/engine/mealPlan.test.ts`, 1 new and 8 updated in `src/log/PlanEditor.test.tsx`, 1 new and 1 updated in `src/profile/Onboarding.test.tsx`.

## 2026-10-13: Change the meal plan from the Food tab (T-061)

- DK asked for a way to make a new plan or change the current one after signup. Spec `specs/T-061-change-plan.md`.
- "Change plan" on the plan line opens an editor, meal by meal: change an amount in grams, swap a food, remove it, or add a food. The day's kcal and protein update at once, with a check like "This plan has 300 kcal less than your target." Changed items say "You changed this."
- "Save plan" saves a new version (the Food tab uses it from today; ticks already made stay as entries). "Cancel" keeps the old plan. A failed save keeps the editor open.
- "Make a new plan", and "Make a meal plan" when there is no plan and targets are set, use the signup protein picks with today's targets, the latest weight (asked for if none) and the usual day. Health answers that stop automatic plans still do; changing by hand is allowed.
- Engine: `setItemGrams`, `removeItem`, `addItem`, `tidyPlan` and `planCheck` in `src/engine/mealPlan.ts`, pure, with plain reasons. Editor loads on its own (1.9 KB); main bundle 127.8 KB.
- Tests: 4 in `src/engine/mealPlan.test.ts`, 8 in `src/log/PlanEditor.test.tsx`.

## 2026-10-13: Meal plan inside the meals (T-063)

- DK asked why the plan sat in its own box above the meals. Spec `specs/T-063-plan-in-meals.md`.
- Planned items now show faded under their meal (Snack under Snacks) with a tick box. A tick logs the item and it shows in the same place as a normal entry, still ticked, with "Change amount". Unticking makes it faded again. Each meal header has "Ate all of Breakfast" and so on.
- One line above the meals says "Your meal plan", its kcal and protein, "N of M eaten", and has "Ate the whole plan". Veg-day and cereal notes show under it.
- Food added by hand shows after the planned items with ✕. Totals count only what was ticked or added. No data change.
- Meal sections and entry rows moved to `src/log/MealSection.tsx`, shared by the plain day and the day with a plan. Main bundle 127.5 KB.
- Tests: 6 new and 8 updated in `src/log/TodayPlan.test.tsx`, 3 updated in `src/log/FoodLog.test.tsx`.

## 2026-10-13: Simple words across the app (T-064)

- DK: "lets keep the verbiage simple around the whole app, to make easy for indians with not much english expierence to understand". Spec `specs/T-064-simple-words.md`, rules and word list in `docs/words.md`.
- Rewrote the text on every screen and in the engine reasons: trend weight is now average weight, deload is light week (the gym word explained once), reps in reserve is reps left, "Not synced yet" is "Waiting for internet", macros is protein, carbs and fat, and deficit, surplus, sensible, roughly, moderate, regain and the idioms ("done its job", "stick to", "run down") are gone. Long sentences were split; none is over 20 words.
- `src/words.test.ts` reads the text in every source file and fails on a word from the list or a sentence over 20 words, so new screens stay simple. Code names keep their gym terms.
- Tests: `src/words.test.ts` (3); expected text updated in 10 existing test files.

## 2026-10-13: Workout logger, part 1 (T-043a)

- DK: "go by best possible approach, proceed". First part of the FitNotes-standard logger from the competitor study. Spec `specs/T-043-workout-logger.md`.
- Weight and reps are filled in from the suggestion or last time's first working set and stay after each set, so the next set is one tap. − and + move weight by the exercise's usual jump (2.5 kg barbell, 5 kg machine) and reps by one.
- A rest timer starts on every set: 2 min 30 s for big lifts, 1 min 30 s for isolation work, with −15 s, +15 s and Skip; it counts from the clock and vibrates at zero.
- Sets can be tagged warm-up, drop set or failure, and carry a note; warm-ups and drop sets are left out of "Last time" and the next-load suggestion. Each workout has notes. All of it waits and syncs offline. Migration `20261019000000_set_tags_notes.sql` (DK runs it before the merge).
- The Training and Progress tabs now load when first opened: the main bundle dropped from 137.6 to 127.3 KB.
- Added tasks from DK's questions: T-061 (change the meal plan from the Food tab), T-062 (diet stats), T-063 (planned items inside each meal instead of a separate box). T-043 split; T-043b is supersets, favourites and custom exercises.
- Tests: 5 in `src/training/Workouts.test.tsx`, `src/training/restTimer.test.ts` (2), 1 in `src/training/training.test.ts`, 1 in `src/training/offlineStore.test.ts`, 1 in `src/db/rls.test.ts`.

## 2026-10-13: Catch up to Steady (T-059c)

- Someone gaining on Catch up now gets a card on the Progress tab once their trend weight reaches a healthy BMI: Catch up has done its job, Steady keeps more of the gain as muscle, and it says how many calories a day less (2,600 to 2,300 kcal, for example).
- "Switch to Steady" saves the new pace and, when a calorie target is set, starts a lower target today with protein and fat kept. "Not now" hides the card on that phone for two weeks. Nothing changes without the tap.
- The check lives in `src/profile/steady.ts`, apart from the onboarding code, so the main bundle stays at 137.6 of 140 KB.
- Tests: 4 in `src/profile/profile.test.ts`, 2 in `src/progress/Progress.test.tsx`.

## 2026-10-13: Tick off the meal plan (T-060)

- The meal plan on the Food tab now has a tick box on each item, each meal and "Ate the whole plan". A tick logs the planned amount under the matching meal; an untick removes only the entry the tick made, never food added by hand. A meal shows part-ticked when some of it is eaten, and the plan heading says "5 of 12 eaten".
- A ticked item can have its amount changed; it stays ticked with the new calories. Veg days tick the veg items. Ticks work offline (T-027) and on any date, and nothing is logged unless ticked.
- Entries keep the plan item they came from in a new `plan_item` column (migration `20261018000000_food_log_plan_item.sql`; DK runs it before the merge so the Food tab can read the column).
- Main bundle 136.9 of 140 KB; the plan view loads on its own (1.7 KB).
- Tests: `src/log/TodayPlan.test.tsx` (8), 2 in `src/log/log.test.ts`, 1 in `src/log/offlineStore.test.ts`, 1 in `src/db/rls.test.ts`.

## 2026-10-13: Plan for ticking off the meal plan (T-060)

- DK asked whether a meal plan can be set for weeks ahead and filled in each day. Today the saved plan is one day of meals shown every day as a guide; nothing is logged from it. A plan laid out by date would go stale when targets change and would fill the log with food not eaten, so DK chose tick boxes instead: tick an item, a meal or the whole day to log it with the planned amount; untick to remove it.
- Draft spec `specs/T-060-tick-plan.md`, task T-060 added. A weekly plan with different days stays a separate, later idea.
## 2026-10-13: Workouts without a connection (T-027b)

- Second part of offline logging, so a gym with no signal works like the Food tab. Starting a workout, logging and removing sets, and the how-did-it-feel answers all work offline. Waiting sets show "Not synced yet", and the Training tab and the workout say how many entries are waiting.
- Workouts and sets get their ids on the phone. The workout is sent before its sets, a lost answer is saved once, and a workout the server refuses takes its waiting sets with it so the queue never sticks.
- The last plans, 14 viewed days, 60 exercise histories and the week review's answers are kept per account, so a planned day with "Last time" and the next-load suggestion runs offline. Editing plans and starting a block still need a connection.
- Food and workouts now share one outbox (`src/sync/outbox.ts`) and one note component. Moving it found a race: a sync asked for just as another one gave up was skipped until the next trigger; fixed and tested.
- Main bundle 136.8 of 140 KB.
- Tests: `src/training/offlineStore.test.ts` (10), 1 in `src/training/Workouts.test.tsx`, `src/sync/outbox.test.ts` (1), 1 in `src/db/rls.test.ts`.

## 2026-10-13: Food logging without a connection (T-027a)

- DK: "go as per the best possible choice"; picked offline logging first because mobile data drops often and logging is the daily habit. Spec `specs/T-027-offline-logging.md` covers food now (T-027a) and workout sets next (T-027b).
- Adds and removals now work offline. Entries show at once with "Not synced yet", and the Food tab says how many are waiting. They are sent in order when the phone is back online, when the app opens and when it returns to the front.
- Each entry gets its id on the phone, so a send whose answer was lost is saved once, not twice. An entry the server refuses outright is dropped and reported ("1 entry couldn't be saved") so the queue never sticks. Removing an entry while it is being sent removes it on the server too.
- The last 14 viewed days and the recent-foods list are kept on the phone per account, so they show offline; signing out clears them, waiting entries stay for the same account.
- Main bundle 134.9 of 140 KB.
- Tests: `src/log/offlineStore.test.ts` (12), 2 in `src/log/FoodLog.test.tsx`, 1 in `src/db/rls.test.ts`.
- Next: T-027b, workout sets offline.

## 2026-10-13: Fix white screen when opening some foods (T-038 follow-up)

- DK: opening some foods from Add food search (packaged products named by barcode, and raw foods) showed a white screen. Cause: the CSV export wrote an empty portions list as `{}` instead of `[]`, so those foods arrived in the database with an object where the app expects a list, and the amount screen crashed.
- Fixed the export (portions always JSON), re-exported both CSVs, made the app treat a non-list as no portions, and added migration `20261017000000_food_portions_fix.sql` to correct rows already imported.
- Tests: 2 more in `src/food/exportFoods.test.ts`.
## 2026-10-13: More muscle-gain paces (T-059a, T-059b)

- "Build muscle and gain weight" now offers Lean, Steady and Faster (0.25, 0.5 and 0.75 % of body weight a week; advanced lifters 0.125, 0.25 and 0.5 %), plus Catch up for underweight adults (up to 1 %, never more than 0.5 kg a week). The recommended pace is picked: Faster when underweight, Steady for healthy-weight beginners, Lean otherwise. A 50 kg beginner aiming for 60 kg now sees about 27 weeks at Faster or 20 at Catch up, instead of 40.
- Each pace says the kg a week and the extra calories a day. Overweight people get Lean and Steady; obese only Lean with a hint to try "Lose fat and build muscle". An eating disorder, diabetes or kidney disease keeps it to Lean (with a care-team note for an eating disorder); no gain pace in pregnancy; no Faster or Catch up under 18.
- Long goals start with a first milestone ("First 2 kg by 8 December") and are said in months. Calorie targets cap gain at 1 % a week, and the plan says how many calories a day it adds. The intermediate default is now 0.25 % (was 0.3 %).
- Tests: 9 in `src/profile/profile.test.ts`, 1 in `src/engine/diet.test.ts`, 4 in `src/profile/Onboarding.test.tsx`.
- Left open: T-059c (suggest Steady from Progress once Catch up reaches a healthy BMI).

## 2026-10-13: Plan for more muscle-gain paces (T-059)

- DK: the build-muscle goal shows a beginner only "Lean", so an underweight person sees a target far away. Studied the code and the evidence (Iraki 2019, Garthe 2013, Helms 2023, NHS) and wrote the draft spec `specs/T-059-gain-pace.md`: Lean, Steady, Faster, and Catch up for underweight adults (at most 0.5 kg a week), recommended by experience and BMI, with health and age limits, the extra calories in each note, and a first milestone in the goal date.
- Tasks T-059a (engine), T-059b (goal step), T-059c (Progress suggestion) added. Nothing built yet; waiting on DK's OK.
## 2026-10-13: Food search from the database (T-038)

- New migration `20261016000000_food_search.sql`: tables `foods` (our dishes and USDA) and `off_products` (Open Food Facts, ODbL, kept apart by a check), a trigram index, and functions `search_foods(q, lim)` and `foods_by_id(ids)`. Anyone can read; no app user can write.
- The database ranks exactly like the app (exact name or alias, then whole words, then word starts; ties to our dishes, then raw foods, then packaged) and also finds small typos ("panner", "chiken") after the real matches. Name and alias now rank equally, so "dahi" finds our curd before packaged dahi.
- The app searches the server as you type (150 ms wait, late answers ignored) and falls back to the bundled list when the foods are not imported yet or the server can't be reached. The person's own foods are searched on the device and shown first. Recent foods are looked up by id.
- `npm run export-foods` writes `data/export/foods.csv` (4,020 rows) and `data/export/off_products.csv` (3,547) for the Supabase import; a test keeps them equal to the bundled list.
- Tests: `src/food/finder.test.ts` (5), `src/db/foodSearch.test.ts` (4, real SQL in PGlite), `src/food/exportFoods.test.ts` (2).
- Left open: DK runs the migration and imports the two CSVs; until then the app uses the bundled list. The bundled list is still shipped as the fallback; dropping it can follow once the server path has run for a while.

## 2026-10-13: Veg days in the plan and log (T-058c)

- A veg day is one of the person's non-veg-free weekdays, or any day they mark with "Make today a veg day". On a usual veg day they can tap "I’m eating non-veg today". The choice is per date and kept on the device. DK asked not to over-customise ("people will choose as per their wish"), so there is no festival calendar, and the onboarding season question is gone.
- The Food tab now shows the saved meal plan ("Your meal plan"). On a veg day, chicken, fish and eggs are swapped for the person's veg protein picks, then paneer, dal, soya or tofu, within limits and with the reason; cereals are trimmed a little to keep calories about the same.
- Opening chicken, fish or egg to log it on a veg day shows a gentle note with veg ideas. Logging still works.
- Fixed: the plan could put more oil in one meal than its per-meal limit; extra now spills to other meals.
- Onboarding and the plan card load only when needed; main bundle about 133 of 140 KB (was 138.7).
- Tests: `src/profile/nonvegDays.test.ts` (3), 2 more in `src/engine/mealPlan.test.ts`, 6 in `src/log/FoodLog.test.tsx`.

## 2026-10-13: Meal plan screens (T-058b)

- "Your plan" now asks "Want us to suggest a day of meals?" under the targets. Yes shows the protein foods the diet allows in plain words (no eggs or chicken for a vegetarian); picking them builds the plan live with the T-058a engine. If the picks can't reach the protein target, the app says how close they get and offers diet-appropriate additions or "Use N g protein instead".
- Each meal lists its foods in raw or dry grams with the cooked hint; a Cooked button per item switches to cooked weight, and Swap changes an item for another food (same protein for protein foods, same calories otherwise, within limits). The plan total, notes and DK's suggestion note are shown. Nothing is kept until "Use this plan", and it is saved when setup finishes.
- New table `meal_plans` (migration `20261015000000_meal_plans.sql`): readable and writable by the person or their active coach, recording who saved each plan. Picks are stored on the plan row. If saving the plan fails, setup still finishes.
- No automatic plan for kidney disease, pregnancy, diabetes, an eating disorder or GLP-1 medicine; the screen suggests a coach or doctor instead.
- The plan screen is a separate 6.7 KB chunk loaded only when shown; the main bundle is 138.7 of 140 KB.
- Tests: 3 in `src/profile/Onboarding.test.tsx`, 4 swap and cooked-weight tests in `src/engine/mealPlan.test.ts`, 1 in `src/db/rls.test.ts`, 1 in `src/profile/mealPlanStore.test.ts`.
- Left open: the migration needs to run on the live database; the saved plan is not yet shown after setup (it appears with the food log work); T-058c next.

## 2026-10-13: Meal plan engine (T-058a)

- DK agreed the meal-plan spec and limits ("start with the appropriate tasks"). Built `src/engine/mealPlan.ts`, a pure engine: it turns the typical day into raw foods, keeps them within each food's per-meal and per-day limit, fills the protein gap with the foods the person picked (more of what they already eat first), fits fat and then calories with their own cereals, adds ICMR basics (400 g vegetables, 100 g fruit, oil near 27 g per 2,000 kcal, sugar at most 25 g), and splits the day into breakfast, lunch, snack and dinner with no meal above 0.55 g protein per kg. Vegetarian lunch and dinner pair a cereal with dal, dairy or soya. Every item has a reason; amounts are raw or dry grams with a cooked or piece hint ("about 230 g cooked", "about 3 roti").
- The protein check comes from the plan itself: "With these foods you can reach about X g of your Y g protein", with diet-appropriate suggestions.
- `src/profile/planFoods.ts`: 23 raw plan foods with the agreed limits, plain-word protein choices filtered by diet, and the typical-day to raw-food mapping. Values match our ingredient database; paneer, soya chunks and whey borrow USDA values (queso fresco, defatted soy flour, whey isolate) until we have Indian packet labels (T-031), and the plan says so on those items.
- Tests: `src/engine/mealPlan.test.ts` (11), `src/profile/planFoods.test.ts` (4).
- Next: T-058b screens (opt-in question, protein picks, the plan with swaps and "Use this plan").

## 2026-10-13: Diet rules and a typical day that matches the diet (T-057)

- "Non-veg" now reads "I eat everything (veg and non-veg)". People who eat non-veg or eggs can pick days (Mon to Sun) and seasons (Shravan, Navratri, Chaturmas, Ramadan fasting days, Lent) when they skip it; stored in `food_rules` as `nonveg_off:*`, no migration. Picking a vegetarian, vegan or Jain diet clears them.
- Every food in the catalogue now carries tags (meat, fish, egg, dairy, honey, root, onion_garlic): dishes from their recipe ingredients, other foods guessed from the name and marked as a guess (`src/food/dietTags.ts`).
- `src/profile/dietRules.ts` decides what a diet, the no-onion-garlic rule and milk, egg or seafood allergies leave out. The typical day shows only allowed rows (Jain and no-onion-garlic get Jain dal and sabzi), filters "Add another food" search the same way, drops counts for rows the diet no longer allows, and shows grams per portion ("1 roti, 40 g").
- Suggested targets now carry DK's note: these are only suggestions, not medical advice, the person decides, and should talk to a doctor if they have a health problem, are pregnant or take regular medicine.
- Tests: `src/profile/dietRules.test.ts` (18), 5 new in `src/profile/Onboarding.test.tsx`, grams checked against the catalogue in `src/profile/profile.test.ts`.
- Left open: packaged foods are tagged by name only (milk in a biscuit is missed until ingredient lists are read); non-veg-free days are used by the meal plan and log in T-058c.

## 2026-10-13: Specs for diet rules and the meal plan (T-057, T-058)

- DK asked for non-veg-free weekdays and seasons, an "I eat everything" option, a typical day that only shows foods the diet allows, and an opt-in suggested day of meals: start from the typical day, add the protein foods the person picks, all in grams (raw by default, cooked at times), with per-food limits and a check that the picks can reach the target.
- Wrote [specs/T-057-diet-rules.md](../specs/T-057-diet-rules.md) (agreed) and [specs/T-058-meal-plan.md](../specs/T-058-meal-plan.md) (draft for DK).
- Checked the plan against ICMR-NIN "My Plate for the Day" (raw grams per food group, sugar 25 to 30 g), Morton et al. 2018 (1.6 g/kg protein), Schoenfeld and Aragon 2018 (0.4 g/kg per meal over 4 meals) and Reed et al. 2021 (soy does not change male hormones). Changes from that check: protein per meal in g/kg instead of a percentage, vegetables, fruit, oil and sugar limits added, cereal plus pulse pairing for vegetarians, no automatic plan when the health check says see a doctor, and soya limits explained as comfort and variety, not hormones.
- Added T-057, T-058a, T-058b, T-058c.
- Tests: none yet (specs only).

## 2026-10-14: Engineering standards (T-051)

- DK asked for SDLC principles, specification-driven development, caching, data structures, architecture and other best practices, and for them to be followed from now on. Checked the project against them and wrote [docs/engineering.md](../docs/engineering.md), which `CLAUDE.md` now requires for every change.
- Spec first: `specs/` with a template; each acceptance criterion gets a test.
- CI now also runs lint, a size budget (`npm run size`, budgets in `build/checkSize.ts`) and `npm audit` for high and critical issues in app dependencies. Node is pinned to 22 (`.nvmrc`, `engines`). Added a PR template and weekly Dependabot updates.
- Caching: the service worker's cache is now named after each build, so a deploy clears the previous build's files (before, they were kept forever). `manifest.webmanifest` is no longer cached.
- Security headers on every response: no MIME sniffing, no framing, strict referrer, camera only for this site.
- Food lookups by id use a map instead of scanning 7,500 foods.
- Security update: `@supabase/supabase-js` moved from 2.45 to 2.117 in the lock file to clear an `auth-js` advisory (GHSA-8r88-6cj9-9fh5); all tests pass.
- Tests: `build/swStamp.test.ts` (3), `build/checkSize.test.ts` (4), `src/pwa.test.ts` (8), `src/food/search.test.ts` (9).
- Follow-ups: T-052 content security policy, T-053 separate preview database and CLI migrations, T-054 end-to-end tests, T-055 accessibility checks, T-056 versions and changelog.

## 2026-10-14: Competitor study and planning details (T-050)

- DK asked whether top Indian and international competitors were researched well, then for FITTR, the RP Strength engine, FitNotes and similar apps in depth, and all details needed for planning. Wrote the [Competitor Study](https://claude.ai/code/artifact/4637175c-d094-4c40-80be-e4826de7c0b3): Indian apps (FITTR, HealthifyMe, Cult.fit, Fitelo, Sugar.fit and others), nutrition apps (MyFitnessPal, MacroFactor, Cronometer, Lose It!, Noom, Carbon), workout loggers (FitNotes in depth, Strong, Hevy, JEFIT, Liftosaur and others), coaching software (Trainerize, TrueCoach, Everfit, Kahunas, Indian tools), the RP engine compared with ours, a side-by-side table, a gaps 2x2, and planning details (priorities, data, free model and costs, risks).
- Added T-043 to T-049 and updated T-018c, T-022b, T-026 and T-038 from the findings. Suggested order: T-038, T-043/T-044, T-027, T-026 with T-042a.
- Limits: Reddit was blocked from the research environment, some prices come from competitors' blogs, and India App Store prices are not labelled by plan.
- Tests: none (task list only).

## 2026-10-14: Admin dashboard plan (T-042)

- DK asked for an admin dashboard to manage the whole app: update all data, manage the application and other admin features. Researched comparable apps, Supabase admin patterns and India's DPDP Act, and wrote the [Admin Dashboard Plan](https://claude.ai/code/artifact/8810062d-8117-486a-8550-1d59ff91c52a): an `/admin` area in the app, built in three phases (T-042a safe access, T-042b food and content after T-038, T-042c running the app), with open questions for DK.
- Tests: none (task list only).

## 2026-10-14: Faster food logging (T-018b, T-019)

- Add food now opens on your often-eaten and recent foods, each with a one-tap + that logs the same amount again; tapping the name opens it to change the amount.
- Quick add: calories with optional protein, carbs and fat, and an optional name, for restaurant meals and anything without a weight.
- New food: from a label per 100 g or per serving (stored per 100 g with the serving as a portion). Impossible numbers are blocked (over 950 kcal or more macros than weight per 100 g), and calories that don't match the macros get a warning before saving. When search finds nothing, one tap creates the food with the search text as its name.
- New recipe: ingredients by raw weight from the whole database, optional cooked weight and servings, with a live per-100 g preview. Saved with the ingredient list.
- Your foods and recipes come first in search, are labelled "My food", and can be deleted under My foods (days already logged keep them). They use the existing `custom_foods` table, private to you and your coach.
- Database: `supabase/migrations/20261014000000_quick_add.sql` lets a log entry have no weight, only when it is a quick add. DK runs it in the SQL Editor before merging.
- Tests: `src/food/custom.test.ts` (10), `src/log/log.test.ts` (14), `src/food/search.test.ts` (8), `src/log/FoodLog.test.tsx` (14), `src/db/rls.test.ts` (23); whole suite 271 passing.
- Open: barcode scan and batch-cooked weighing (T-018c).

## 2026-10-13: Typical day: any food or your own entry (T-017)

- The typical-day step in onboarding was limited to 14 everyday foods. Now "+ Add another food" searches the whole food database (one usual portion, or 100 g), and "Can't find it? Enter it yourself" takes a name, calories a day and optional protein. Added foods get the same + and − counters, and the daily estimate updates as you go.
- Saved inside `current_diet` (jsonb) as `extras`, so no database change.
- Tests: `src/profile/profile.test.ts` (20), `src/profile/Onboarding.test.tsx` (9); whole suite 244 passing.

## 2026-10-13: Onboarding, suggested targets and progress (T-017, T-021, T-022)

- Researched onboarding in MacroFactor, MyFitnessPal, Noom, Cronometer, Lose It!, HealthifyMe, Fitbod, Carbon, RP and FitNotes; findings and our choices in `docs/onboarding-research.md`.
- New users see 7 short steps with a progress bar, or can skip to logging (remembered): about you with a live BMI using Indian cut-offs and an optional waist size; a health checklist whose answers change the plan (no weight-loss targets in pregnancy, gentle pace only with an eating disorder, diabetes or kidney disease, protein capped for kidney disease) with doctor notes; training (activity, days, experience, equipment); goal with a pace in % of body weight and a live goal date for an optional target weight; food habits (diet type, no onion or garlic, fasting, allergies); a typical day of eating from tap counts of everyday Indian foods, priced from our food database; and a plan with BMI, maintenance as a range, the goal date and suggested targets with every reason. Targets are saved only if the person taps "Use these targets" (stored as `suggested`); "I'll set my own" leaves them to the person or coach.
- First weigh-in and waist are saved to progress. Coaches skip onboarding. If the profile can't load, the app opens anyway.
- New Progress tab: save or update today's weight, the trend weight with its weekly change, advice against the goal (for example, losing faster than 1 % a week), a 90-day chart, recent weigh-ins with remove, and body measurements with the change since the first.
- Database: `supabase/migrations/20261013100000_onboarding.sql` adds the new profile columns; DK runs it in the SQL Editor before merging.
- Tests: `src/profile/profile.test.ts` (17), `src/profile/Onboarding.test.tsx` (8), `src/progress/progress.test.ts` (16), `src/progress/Progress.test.tsx` (4), `src/App.test.tsx` (5), `src/db/rls.test.ts` (+2); whole suite 240 passing.
- Open: progress photos and strength trends (T-022b); using the food habits in search and the food log (T-041).

## 2026-10-13: Live on Vercel (T-028)

- The app is live at https://track-me-fit-dpvu.vercel.app with the Supabase address and anon key set in Vercel. DK signed in with Google on the live site.
- Fix on the way: the Supabase address was first typed with a digit 1 instead of a lowercase l, so Google sign-in went to an address that does not exist.
- Tests: no code change; whole suite 188 passing.

## 2026-10-13: Ready to go online (T-028, T-040)

- The app can be installed on phones: icon, `manifest.webmanifest`, and a service worker (`public/sw.js`) that caches the page and built files so it opens without a connection. Supabase requests always go to the network. Registered in production builds only.
- `vercel.json`: Vite build, app paths go to the app, built files cached for a year, the service worker never cached.
- `docs/deploy.md`: DK's one-time Vercel and Supabase steps, and how to install on Android and iPhone.
- DK ran the progression migration on the live project (T-039).
- Tests: `src/pwa.test.ts` (6); whole suite 188 passing.

## 2026-10-13: Weekly progression and deloads (T-024)

- After a workout, "How did it feel?" asks per muscle trained: sore going in, how hard, anything hurt. Skippable.
- Plans show "Week 2 of 4" (or "Deload week"). "Review week" shows each muscle's sets now and next week with the training engine's reason, from the last 7 days of answers and the strength trend (best estimated one-rep max per session). Nothing changes until "Apply these changes"; sets are added to the exercise with the fewest and removed from the one with the most, within 1-10 sets per exercise and 10 per muscle per session.
- A deload is suggested after the hard weeks, when the person feels run down, or when half the muscles drop at once. In a deload week the logger shows half the sets at week-1 weights and stops suggesting increases; the new block starts the week after.
- The logger shows each week's effort target (reps short of failure) from the engine.
- New migration `20261013000000_progression.sql` (block start date, `muscle_feedback` with privacy rules). Tests now run every migration in order.
- Tests: `src/training/progression.test.ts` (10), `src/training/Review.test.tsx` (3), `src/db/rls.test.ts` (+2); whole suite 182 passing.

## 2026-10-13: Workout plans and logger (T-023, T-025)

- The app now has two tabs, Food and Training. Training shows today's workouts, "Start a workout" (a plan day or an empty workout) and your plans.
- Plan builder: name, up to 14 days, exercises from a 63-exercise library (search by name, gym slang like "rdl" or "ohp", or muscle), sets and rep range per exercise. Problems are listed in plain words before saving. Deleting a plan hides it so past workouts keep their day.
- Logger: each exercise shows the plan target, what you did last time, and a suggestion for today from the training engine's double progression with its reason (for example "Hit 10 reps on every set, so the weight goes up"). The weight and reps are filled in from the suggestion; each set saves as soon as it is logged, with optional reps in reserve.
- Saved to the workout tables through `src/training/supabaseStore.ts`.
- Tests: `src/training/training.test.ts` (12), `src/training/Workouts.test.tsx` (5); whole suite 167 passing.
- Open: weekly set changes per muscle from feedback and deloads (T-024).

## 2026-10-13: Daily targets (T-020)

- The food log shows what is left for the day (calories, protein, carbs, fat), or "over" in red, under the day totals. With no targets yet it shows "Set your daily targets".
- The targets form takes calories and the three macros, checks the allowed ranges, can fill carbs from the calories left, and notes when the macros add up to more than 5% away from the calories (saving is still allowed).
- New targets start today and earlier days keep theirs; targets set by a coach say so. Saved to `diet_targets` (`src/targets/stores.ts`). Engine suggestions stay optional (T-021).
- Tests: `src/targets/targets.test.ts` (8), `src/targets/TargetsFood.test.tsx` (4); whole suite passing.

## 2026-10-13: Live on Supabase (T-037)

- DK created the Supabase project (Mumbai) and ran the migration. All 13 tables respond, and a test sign-up (`+test` address) created its profile through the signup trigger.
- Email and Google sign-in are switched on; the Site URL is `http://localhost:5173` until the Vercel deploy (T-028).
- The Project URL and anon key go in `.env.local` (never committed). Still to try: DK signs in with Google once in the app.

## 2026-10-12: Food log (T-018)

- After sign-in the app opens on today's food log: Breakfast, Lunch, Snacks and Dinner with calories per meal and day totals for calories, protein, carbs and fat. Arrows move to earlier days (never the future).
- "+ Add food" searches 7,567 foods (2,559 dishes, 1,461 raw foods, 3,547 packaged products) by name, Hinglish or regional alias, or brand; whole-word matches rank first, home dishes before products (`src/food/catalogue.ts`, `src/food/search.ts`).
- Amounts in portions (1 katori, 1 roti, ...) or grams, with a raw / cooked / as-sold hint and a live macro preview. Entries keep a snapshot of name and macros (`src/log/types.ts`); saved to `food_logs` through `src/log/supabaseStore.ts`.
- Tests: `src/log/log.test.ts` (7), `src/log/FoodLog.test.tsx` (7), `src/food/search.test.ts` (7); whole suite passing.
- Open: the food list is a 535 KB (gzip) download on first search (T-038); quick add, barcode and batch cooking are T-018b. Paneer and jaggery dishes still wait on labels (T-031).

## 2026-10-12: Database and sign-in (T-013, T-014)

- `supabase/migrations/20261012000000_init.sql`: profiles (user or coach, onboarding history), coach links, custom foods, food logs, diet targets, weigh-ins, measurements, custom exercises, workout plans, sessions and sets. Row-level security on every table.
- Privacy tests run the real migration in PGlite (Postgres in WebAssembly) with a stand-in auth schema: `src/db/rls.test.ts`, 17 tests, checked by weakening a rule and seeing tests fail.
- Sign-in: `src/auth/` (email + password, Google for regular users, password reset, user or coach on sign-up), behind an `AuthService` interface; `src/auth/SignIn.test.tsx`, 13 tests.
- `docs/supabase-setup.md`: the one-time steps for DK. Open: T-037 go live.

## 2026-10-12: 3,336 dishes, 3,547 products, 1,461 raw foods (T-016, T-033, T-035)

- Second batch of dish files: restaurant 350, South 350, regional non-veg 325, sweets and bakery 348, thalis/diet/vrat/Jain 343, regional veg 245. Duplicates removed across files; duplicate raw mango label merged.
- 3,336 dishes in total; 2,559 compute now, 777 wait on 69 label ingredients (`labels-needed.csv` in project files).
- `data/off/india_products.csv`: 3,547 Indian packaged products from the Open Food Facts India export DK downloaded (25,389 rows; most lacked full nutrition). ODbL, kept separate; `src/food/off.ts` loads it.
- `src/food/indian/raw-foods.ts`: 1,461 USDA foods with Indian names and aliases.
- Tests: whole suite 87 passing.
- Note: during merging, a git stash briefly emptied the in-progress dish files; all files were restored and each writer confirmed nothing was lost. Don't stash while writers are working.

## 2026-10-12: 1,375 Indian dishes (T-016)

- Recipes split into category files (`src/food/indian/recipes/`): North 274, South 290, West/East/Northeast 252, snacks/street food/drinks 261, non-veg and sweets 273, plus the 25 core dishes.
- Recipes can use any USDA food directly as `usda:<fdc_id>`; 37 non-USDA ingredients wait on label values. Duplicate label ingredients merged into `extra-ingredients/shared.ts`.
- 1,115 dishes compute now; 260 wait on labels (paneer 72, jaggery 67, khoya 21, ...).
- Energy check relaxed for vegetables and fruit (USDA carbs include fibre); added a 0-900 kcal per 100 g range check and a 1,000-dish minimum. Whole suite: 79 passing.
- Review sheet for DK: project files `trackmefit-review/indian-dishes-v2.csv`.
- Open: T-031 labels, T-033 packaged products, T-034 recipe review.

## 2026-10-12: USDA values loaded (T-030)

- DK downloaded the USDA SR Legacy zip; `data/usda/sr_legacy_macros.csv` now holds all 7,793 foods (public domain).
- Fixed the atta match. 26 of 28 ingredients come from USDA; paneer and poha wait on label values.
- `src/food/indian/database.ts` builds the database: 22 of 25 dishes computed, 3 pending (paneer bhurji, palak paneer, poha).
- Tests: `src/food/indian/database.test.ts` (6) runs against the real USDA table, including sense checks (rice ~122 kcal/100 g, a roti ~100 kcal). Whole suite: 75 passing.

## 2026-10-12: Own Indian food database, stage 1 (T-016, T-029)

- Method: compute each dish from raw USDA ingredients and our own standard recipes, so the data is ours. See `docs/indian-food-database.md`.
- `src/food/recipe.ts`: recipe calculator (per 100 g of cooked dish) and `rawEquivalent` for batch cooking.
- `src/food/indian/ingredients.ts`: 28 raw ingredients with Hinglish search names. `src/food/indian/recipes.ts`: 25 everyday dishes with katori, roti and plate portions.
- `scripts/usda/extract_macros.py` and `src/food/indian/resolve.ts`: load USDA values from the free bulk files (no API key).
- Tests: 20 new tests; whole suite 69 passing.
- Open: USDA download blocked from Claude's cloud setup (T-030), paneer and poha label values (T-031), cooked weights unverified (T-032).

## 2026-10-12: Food data plan, food model, task tracking, CI (T-007, T-008, T-009)

- Added `docs/food-data.md`: every free food source, its licence and how we use it. USDA is public domain; IFCT and INDB need permission; Open Food Facts is ODbL and kept separate; FatSecret, Edamam and Nutritionix are not free for India.
- Added `src/food/types.ts` (food model, grams and portions, calorie sanity check) and `src/food/usda.ts` (USDA record mapper).
- Tests: `src/food/food.test.ts`, 8 tests. Whole suite: 49 passing.
- Added `tasks/TASKS.md`, this log, `CLAUDE.md` conventions, and a GitHub Actions workflow running type checks and tests.
- Open: USDA API key (DK), IFCT and INDB permissions.

## 2026-10-12: Project setup and engines (T-004, T-005, T-006)

- React + TypeScript + Vite project, named Track Me Fit.
- `src/engine/diet.ts`: starting calorie estimate, trend weight, weekly expenditure update, calorie and macro targets, Indian BMI bands, protein rules.
- `src/engine/training.ts`: volume landmarks, weekly set decisions, fractional volume, per-session cap, effort targets, weight progression, deloads.
- Tests: 41 passing.
