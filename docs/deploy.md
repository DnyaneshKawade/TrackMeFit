# Putting the app online (Vercel, free)

One time, about ten minutes. After this, every merge to `main` goes live by itself, and every pull request gets its own preview link.

## 1. Connect the repository

1. Go to https://vercel.com and choose **Continue with GitHub**, using the account that owns `TrackMeFit`.
2. Click **Add New… → Project**, find **TrackMeFit** and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions** and allow the repository.
3. Vercel detects **Vite**. Leave the build settings as they are; `vercel.json` sets them.
4. Open **Environment Variables** and add both, for all environments:
   - `VITE_SUPABASE_URL` = your Project URL (`https://….supabase.co`, without `/rest/v1/`)
   - `VITE_SUPABASE_ANON_KEY` = your anon key (starts with `eyJ`)

   Never add the `service_role` or secret key.
5. Click **Deploy**. When it finishes, Vercel shows your address, such as `https://trackmefit.vercel.app`.

## 2. Tell Supabase the new address

In Supabase, open **Authentication → URL Configuration**:

- **Site URL**: your Vercel address, for example `https://trackmefit.vercel.app`.
- **Redirect URLs**: add your Vercel address, `https://*-<your-vercel-team>.vercel.app/**` for preview links, and keep `http://localhost:5173`.

Sign-up confirmation emails, password resets and Google sign-in all return to these addresses. Google itself needs no change: it returns to Supabase, which then returns to the app.

## 3. Install it on your phone

- **Android (Chrome)**: open the address, then the ⋮ menu → **Install app** (or **Add to Home screen**).
- **iPhone (Safari)**: open the address, tap **Share → Add to Home Screen**.

The app opens full screen with its own icon. After the first visit it also opens without a connection, but logging needs a connection until offline saving is added (T-027).
