# Track Me Fit

Free, India-first diet and workout app: plans, tracks and adjusts each person's diet and training, with optional coaches.

Planning docs live in the project: Fitness App Plan and Training and Diet Engine.

## Stack
- React + TypeScript + Vite, installable web app (PWA)
- Supabase for sign-in and backup (to be added)
- Hosted on Vercel (to be added)

## Engines
- `src/engine/diet.ts`: starting calorie estimate, trend weight, adaptive expenditure, calorie and macro targets
- `src/engine/training.ts`: volume landmarks, weekly set changes, set distribution, effort targets, weight progression, deloads

## Commands
- `npm install`
- `npm test` runs the engine tests
- `npm run dev` starts the app locally
