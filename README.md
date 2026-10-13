# Track Me Fit

Free, India-first diet and workout app: plans, tracks and adjusts each person's diet and training, with optional coaches.

Planning docs live in the project: Fitness App Plan and Training and Diet Engine.

## Stack
- React + TypeScript + Vite, installable web app (PWA)
- Supabase for sign-in and data (Mumbai)
- Hosted on Vercel

## Engines
- `src/engine/diet.ts`: starting calorie estimate, trend weight, adaptive expenditure, calorie and macro targets
- `src/engine/training.ts`: volume landmarks, weekly set changes, set distribution, effort targets, weight progression, deloads

## Commands
- `npm install`
- `npm run dev` starts the app locally
- `npm run check` runs types, lint and all tests
- `npm run build && npm run size` builds and checks the size budget

How we work: [docs/engineering.md](docs/engineering.md). Feature specs: [specs/](specs/).
