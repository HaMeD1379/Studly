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

Run them together with the prod compose file:
```bash
# Windows cmd
set REGISTRY=docker.io
set NAMESPACE=<your-dockerhub-username>
set IMAGE_TAG=latest

docker compose -f infra/docker/docker-compose.prod.yml up -d
```

## Notes
- Adjust backend `DATABASE_URL` if you deploy a managed Postgres instead of the local container.
- Commit the schema SQL; avoid committing secrets.
