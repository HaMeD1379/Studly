# Contributing to Studly

## Getting started
1. Use Node 20 (see `.nvmrc`) and pnpm or npm.
2. `cp apps/backend/.env.example apps/backend/.env.local`
3. `cp apps/frontend/.env.example apps/frontend/.env.local`
4. Run locally via Docker Compose (see `infra/docker/compose.dev.yml`) or per-app dev scripts.

## Branching & PRs
- Trunk-based: short-lived feature branches → PR → CI green → review → merge.
- Follow Conventional Commits (e.g., feat:, fix:, chore:).

## Code style
- ESLint + Prettier enforced in CI.
- Keep tests close to code. Add/extend test coverage on changed areas.

## Secrets
- Never commit real secrets. Use `.env.local` (ignored). Use Vercel/Railway envs in prod.
