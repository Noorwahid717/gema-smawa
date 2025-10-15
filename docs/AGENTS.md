# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `src/app`; shared UI sits in `src/components`, domain logic in `src/features`, hooks in `src/hooks`, utilities in `src/lib`, and shared types in `src/types`. Database schema, migrations, and seeds reside in `prisma`. Static assets live in `public`. Playwright suites are in `tests/e2e` with fixtures in `tests/fixtures`. Root shell scripts handle seeding, deployment, and environment checks—keep them executable.

## Build, Test, and Development Commands
`npm run dev` starts the Turbopack development server. `npm run build` produces a production bundle (triggering `prisma generate` via `prebuild`), and `npm start` serves it. `npm run lint` executes ESLint with Next.js presets. `npm run test:e2e` runs the Playwright suite; pass `--project=chromium` to target a browser. Database helpers (`npm run db:push`, `npm run db:seed`, `npm run db:migrate`) keep the Prisma schema aligned with your environment.

## Coding Style & Naming Conventions
The project uses TypeScript (`.ts`/`.tsx`) and React function components. Use PascalCase for components, camelCase for helpers, and prefix hooks with `use`. Follow the two-space indentation and trailing comma style seen in the repo. Run `npm run lint` before pushing and resolve warnings for unused variables, `any`, accessibility, and image usage promptly.

## Testing Guidelines
Playwright drives regression coverage from `tests/e2e`. Name specs after the user flow (for example, `student-dashboard.spec.ts`). Prefer data attributes to brittle selectors, and reuse fixtures from `tests/fixtures`. Run `npm run test:e2e` before opening a pull request, scoping to relevant flows with `--grep` when speed matters. When tests need seeded data, run the matching seed script (for example, `npm run db:seed` or `scripts/seed-tutorial-articles.sh`) so scenarios align with expectations.

## Commit & Pull Request Guidelines
Commits in this repo follow short, imperative messages (e.g. `Handle WebSocket upgrades in edge runtime`). Limit each commit to a single concern and include generated assets—such as updated Prisma clients—when they change. Pull requests should summarise intent, link any issue or task, document manual validation, and attach UI screenshots or recordings for UI changes. Confirm lint, build, and Playwright checks succeed locally before requesting review.

## Environment & Data Setup
Create a `.env` from `.env.example` and fill every required secret before running Prisma commands. Use `scripts/verify-env.sh` to confirm configuration completeness, and rely on seed helpers (`npm run db:seed`, `scripts/seed-tutorial-articles.sh`, or `seed-via-api.js`) to populate local data. Do not commit `.env` files or local databases; use `scripts/setup-vercel-env.sh` and `vercel:build` when preparing environment variables for shared deployments.
