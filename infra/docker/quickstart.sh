#!/usr/bin/env bash
# Quickstart script to build and run Studly locally via Docker Desktop
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
root=$(cd "$here/../.." && pwd)
compose_file="$root/infra/docker/compose.dev.yml"

backend_env="$root/apps/backend/.env.local"
frontend_env="$root/apps/frontend/.env.local"

docker_compose() {
  docker compose -f "$compose_file" "$@"
}

ensure_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker Desktop isn't running or Docker CLI not available." >&2
    exit 1
  fi
}

ensure_env_files() {
  # Create backend env if missing
  if [[ ! -f "$backend_env" ]]; then
    echo "Creating $backend_env"
    cat > "$backend_env" <<'EOF'
# Backend local environment
# Internal API token (must match frontend VITE_RAILWAY_API_TOKEN)
INTERNAL_API_TOKEN=studly-local-token

# Optional: Supabase credentials for auth features (leave empty to use fallback)
# SUPABASE_URL=
# SUPABASE_ANON_KEY=

# Optional: Where Supabase password reset emails should redirect
# PASSWORD_RESET_REDIRECT_URL=http://localhost:5173/reset-password
EOF
  fi

  # Create frontend env if missing
  if [[ ! -f "$frontend_env" ]]; then
    echo "Creating $frontend_env"
    cat > "$frontend_env" <<'EOF'
# Frontend local environment
# Base URL that the browser will call (backend exposed by compose at 3000)
VITE_API_BASE_URL=http://localhost:3000/api

# Must match apps/backend/.env.local INTERNAL_API_TOKEN
VITE_RAILWAY_API_TOKEN=studly-local-token
EOF
  fi
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  up        Build and start all services (foreground)
  up -d     Build and start detached
  down      Stop and remove containers, networks, and volumes
  logs      Follow logs for all services
  rebuild   Rebuild images without cache

Examples:
  $0 up
  $0 up -d
  $0 logs
  $0 down
  $0 rebuild
EOF
}

cmd=${1:-up}
shift || true

ensure_docker
ensure_env_files

case "$cmd" in
  up)
    docker_compose up "$@"
    ;;
  down)
    docker_compose down -v
    ;;
  logs)
    docker_compose logs -f
    ;;
  rebuild)
    docker_compose build --no-cache
    ;;
  *)
    usage
    exit 1
    ;;
esac

# Helpful endpoints
if [[ "${cmd}" == "up" ]]; then
  echo
  echo "Studly is starting. When ready:"
  echo "  Backend:  http://localhost:3000 (health: /health)"
  echo "  Frontend: http://localhost:5173"
  echo "  Postgres: localhost:5432 (user: studly, pass: studly)"
fi
