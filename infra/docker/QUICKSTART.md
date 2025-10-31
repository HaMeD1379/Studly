# Studly Docker Quickstart (Local)

This guide helps you build and run the full stack locally using Docker Desktop.

Works on macOS/Linux natively. On Windows, use Git Bash, WSL, or run the compose commands directly in cmd/PowerShell.

## Prerequisites
- Docker Desktop installed and running
- Git Bash (Windows) or any bash shell to run the script (optional)

## One-liner quickstart
From the repo root:

```bash
bash infra/docker/quickstart.sh up -d
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000 (health at /health)
- Postgres: localhost:5432 (user/pass: studly/studly)

The script auto-creates two env files if missing:
- apps/backend/.env.local
- apps/frontend/.env.local

These ensure the frontend can call the backend with the x-api-key the backend expects.

## Manual steps (if you prefer commands)
1) Create environment files once:

Create `apps/backend/.env.local`:

```
INTERNAL_API_TOKEN=studly-local-token
# Optional Supabase creds if you want auth flows locally
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# PASSWORD_RESET_REDIRECT_URL=http://localhost:5173/reset-password
```

Create `apps/frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_RAILWAY_API_TOKEN=studly-local-token
```

2) Start services with Compose:

- Windows cmd:

```
docker compose -f infra\docker\compose.dev.yml up --build
```

- Bash / PowerShell:

```
docker compose -f infra/docker/compose.dev.yml up --build
```

3) Open the apps:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

4) Stop everything:

```
docker compose -f infra/docker/compose.dev.yml down -v
```

## Troubleshooting
- Port 5432/3000/5173 already in use: stop any service occupying those ports, or change mappings in `infra/docker/compose.dev.yml`.
- Frontend shows 401 Unauthorized: ensure `VITE_RAILWAY_API_TOKEN` in frontend matches `INTERNAL_API_TOKEN` in backend.
- Supabase features fail: set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `apps/backend/.env.local` or keep them empty to use the safe fallback.
- Docker not starting: make sure Docker Desktop is running.

## Production images (optional)
If you have images pushed to Docker Hub by CI, you can run them with:

```
set REGISTRY=docker.io
set NAMESPACE=<your-dockerhub-username>
set IMAGE_TAG=latest

docker compose -f infra/docker/docker-compose.prod.yml up -d
```

