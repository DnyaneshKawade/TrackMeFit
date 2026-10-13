# Setting up Supabase (one time)

Supabase hosts the database and sign-in. The free plan is enough to start.

1. **Create the project.** Sign in at https://supabase.com, click **New project**, name it `trackmefit`, choose region **South Asia (Mumbai)**, and save the database password somewhere safe.
2. **Create the tables and privacy rules.** In the project, open **SQL Editor**, paste the whole of `supabase/migrations/20261012000000_init.sql`, and click **Run**.
3. **Email sign-in** is on by default. Under **Authentication → URL Configuration**, set the Site URL to where the app runs (for now `http://localhost:5173`, later the Vercel address).
4. **Google sign-in (optional).** Under **Authentication → Providers → Google**, follow Supabase's steps to create a Google OAuth client and paste its ID and secret.
5. **Connect the app.** Under **Project Settings → API**, copy the Project URL and the `anon` public key into `.env.local` (see `.env.example`). Never use the `service_role` key in the app.

Then `npm run dev` shows the sign-in screen.

## When a new migration is added

Each change to the database is a new file in `supabase/migrations/`, named by date. When a pull request adds one, open **SQL Editor**, paste the new file and click **Run** before using the app from that pull request. Run them in name order; each runs once.

| File | What it adds |
|---|---|
| `20261012000000_init.sql` | All tables and privacy rules |
| `20261013000000_progression.sql` | Training block start date on plans, and how-did-it-feel answers after workouts |
| `20261013100000_onboarding.sql` | Onboarding answers: goal pace and target weight, food habits and fasting, allergies, a typical day of eating, where you train, other health notes, and when onboarding was done |

## What the privacy rules guarantee

Tested in `src/db/rls.test.ts`:
- People see and change only their own logs, weigh-ins, measurements, foods and workouts.
- Only coach accounts can invite clients. An invited coach sees nothing until the client accepts.
- An active coach can read the client's data and set diet targets and workout plans, but cannot edit the client's logs.
- When the client ends the coaching, the coach loses access immediately.
- Nobody can change their own role, and signed-out visitors see nothing.
