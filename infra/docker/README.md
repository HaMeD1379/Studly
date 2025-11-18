# Docker & Compose (Sprint 2)

This folder contains Dockerfiles and Compose stacks for local dev and production delivery.

## Prereqs
- Docker Desktop
- Optional: Supabase CLI if you want to dump schema from your project
- DockerHub account + repo secrets in GitHub: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN

## Quickstart
See QUICKSTART.md for a one-command startup script, or run the compose commands below.

## Generate local DB schema from Supabase
```bash
supabase db dump --schema public --exclude-data -f infra/docker/db/init/01_schema.sql
```
Files under `infra/docker/db/init/` run automatically on the first DB start to create schema.

## Local dev (db + backend + frontend)
```bash
# from repo root
bash infra/docker/quickstart.sh up -d
# or
# docker compose -f infra/docker/compose.dev.yml up --build
```
- Backend: http://localhost:3000
- Frontend (served by nginx): http://localhost:5173
- Postgres: localhost:5432 (studly/studly)

To pass Supabase REST creds to backend locally:
```bash
export SUPABASE_URL=https://<your>.supabase.co
export SUPABASE_ANON_KEY=ey...
bash infra/docker/quickstart.sh up -d
```

## Production delivery (images from DockerHub)
The CD workflow builds and pushes:
- docker.io/<DOCKERHUB_USERNAME>/studly-backend
- docker.io/<DOCKERHUB_USERNAME>/studly-frontend

Run them together with the prod compose file (self-contained: mock mode, no DB required):
```bash
# Windows cmd
set REGISTRY=docker.io
set NAMESPACE=<your-dockerhub-username>
set IMAGE_TAG=latest

docker compose -f infra\docker\docker-compose.prod.yml up -d
```

Services will be available at:
- Backend: http://localhost:3000 (health: /health)
- Frontend: http://localhost:8080

Notes:
- The backend runs with `STUDLY_USE_MOCK=1` and accepts `INTERNAL_API_TOKEN=studly-local-token`.
- The frontend image is baked to call `http://localhost:3000/api` and sends `x-api-key=studly-local-token`.
- If you later add a real DB, modify the compose file to provide `DATABASE_URL` and remove `STUDLY_USE_MOCK`.

# Note: The legacy `docker-compose.prod.yml` file has been removed because it was not used by CI/CD.
# If you used it for manual runs, prefer `compose.mem.yml` or your own compose file outside this repo.
