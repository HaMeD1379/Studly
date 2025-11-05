# Studly Docker Quickstart (Local)

This guide helps you build and run the full stack locally using Docker Desktop.

Works on macOS/Linux natively. On Windows, use Git Bash, WSL, or run the compose commands directly in cmd/PowerShell.

## Prerequisites
- Docker Desktop installed and running
- Git Bash (Windows) or any bash shell to run the script (optional)

## Option A: Self-contained (no external DB, no Supabase)
Use the in-memory mock (baked into the backend image). No env files needed.

- Windows cmd:

```
docker compose -f infra\docker\compose.mem.yml up --build
```

- Bash / PowerShell:

```
docker compose -f infra/docker/compose.mem.yml up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000 (health at /health)

The frontend is pre-configured to send x-api-key=studly-local-token. The backend accepts it by default in mock mode.

## Option B: Full stack with Postgres (local dev)
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

## Running the pushed production images (no build required)
The CD workflow builds and pushes:
- docker.io/<DOCKERHUB_USERNAME>/studly-backend
- docker.io/<DOCKERHUB_USERNAME>/studly-frontend

Run them together with the prod compose file (mock mode, no DB needed):

- Windows cmd (set vars inline):

```
set REGISTRY=docker.io
set NAMESPACE=<your-dockerhub-username>
set IMAGE_TAG=latest

docker compose -f infra\docker\docker-compose.prod.yml up -d
```

- Or use an env file to avoid typing variables:

```
copy infra\docker\.env.prod.example infra\docker\.env
REM Edit infra\docker\.env and set NAMESPACE

docker compose --env-file infra\docker\.env -f infra\docker\docker-compose.prod.yml up -d
```

- Bash / PowerShell (inline):

```
REGISTRY=docker.io \
NAMESPACE=<your-dockerhub-username> \
IMAGE_TAG=latest \
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000 (health at /health)

Notes:
- The prod compose pins `INTERNAL_API_TOKEN=studly-local-token` and `STUDLY_USE_MOCK=1` so it works out-of-the-box without a DB.
- The frontend image baked by CD uses `VITE_API_BASE_URL=http://localhost:3000/api` and sends `x-api-key=studly-local-token`.

## Running images from Docker Hub (quick run)
If you prefer to pull and run the pre-built images directly from Docker Hub you can use `docker run`.

These examples are intentionally generic: Docker often assigns a random container name when you don't pass `--name` (e.g., `vigorous_jennings`). If you want a predictable container name pass `--name <your-name>`.

- Run the backend (exposes container port 3000 to host port 3000):

Windows cmd / PowerShell / Bash:

```
docker run -d -p 3000:3000 hamed1379/studly-backend:latest
```

- Run the frontend (exposes container port 80 to host port 8080):

Windows cmd / PowerShell / Bash:

```
docker run -d -p 8080:80 hamed1379/studly-frontend:latest
```

After starting containers you can discover the host port mappings and container names with:

```
docker ps
```

Or to inspect a specific container's mapped ports:

```
docker port <container-id-or-name>
```

Example notes:
- Visit the frontend at http://localhost:8080 and the backend at http://localhost:3000.
- If you used different host ports (for example `-p 5000:3000`) open the corresponding host port.
- To stop a container:

```
docker stop <container-id-or-name>
```

To remove it:

```
docker rm <container-id-or-name>
```

### Helpful tips
- Docker Desktop may show a friendly random container name (like `vigorous_jennings`) when you omit `--name`; this is normal. Use `docker ps` to map name -> ports.
- If you need help with Docker Desktop, try asking the Gordon LLM assistant inside Docker Desktop (look for "Gordon" in the Docker Desktop UI).

## Manual steps (Option B only, if you prefer commands)
1) Create environment files once (only for Option B):

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

2) Start services with Compose (Option B):

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
docker compose -f infra\docker\compose.dev.yml down -v
```

## Troubleshooting
- Port 5432/3000/5173/8080 already in use: stop any service occupying those ports, or change mappings in the compose files.
- Frontend shows 401 Unauthorized: ensure `VITE_RAILWAY_API_TOKEN` in frontend matches `INTERNAL_API_TOKEN` accepted by backend (default studly-local-token in mock mode).
- Docker not starting: make sure Docker Desktop is running.
