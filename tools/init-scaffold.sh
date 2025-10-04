#!/usr/bin/env bash
set -euo pipefail

mk() { mkdir -p "$1"; }
keep() { mk "$(dirname "$1")"; [ -f "$1" ] || touch "$1"; }
# Updated write_if_absent to consume the here‐document from stdin.
write_if_absent() { # $1=path, $2=heredoc marker
  local p="$1" m="$2"
  mk "$(dirname "$p")"
  if [ -f "$p" ]; then
    echo "skip (exists): $p"
    # consume heredoc if file exists
    while IFS= read -r line; do
      [ "$line" == "$m" ] && break
    done
  else
    cat > "$p"
    echo "created: $p"
  fi
}

# --- Directories + .gitkeep ---
for d in \
  apps/frontend \
  apps/backend \
  packages/api-contract \
  packages/ui \
  packages/utils \
  packages/tsconfig \
  packages/eslint-config \
  infra/docker \
  infra/k6 \
  infra/scripts \
  docs/ADR \
  .github/ISSUE_TEMPLATE \
  .github/workflows \
  .husky \
  .changeset \
  worksheets/sprint0
do
  keep "$d/.gitkeep"
done

# --- .editorconfig (shared editor rules) ---
write_if_absent ".editorconfig" EOF_EDITORCONFIG <<EOF_EDITORCONFIG
# EditorConfig helps maintain consistent coding styles
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
EOF_EDITORCONFIG

# --- CODEOWNERS (adjust GitHub handles later) ---
write_if_absent "CODEOWNERS" EOF_CODEOWNERS <<EOF_CODEOWNERS
# Map folders to reviewer groups/owners
# Replace @studly/* with real GitHub handles or teams
/apps/frontend/   @studly/frontend
/apps/backend/    @studly/backend
/packages/        @studly/core
/docs/            @studly/docs
EOF_CODEOWNERS

# --- CONTRIBUTING.md ---
write_if_absent "CONTRIBUTING.md" EOF_CONTRIB <<EOF_CONTRIB
# Contributing to Studly

## Getting started
1. Use Node 20 (see \`.nvmrc\`) and pnpm or npm.
2. \`cp apps/backend/.env.example apps/backend/.env.local\`
3. \`cp apps/frontend/.env.example apps/frontend/.env.local\`
4. Run locally via Docker Compose (see \`infra/docker/compose.dev.yml\`) or per-app dev scripts.

## Branching & PRs
- Trunk-based: short-lived feature branches → PR → CI green → review → merge.
- Follow Conventional Commits (e.g., feat:, fix:, chore:).

## Code style
- ESLint + Prettier enforced in CI.
- Keep tests close to code. Add/extend test coverage on changed areas.

## Secrets
- Never commit real secrets. Use \`.env.local\` (ignored). Use Vercel/Railway envs in prod.
EOF_CONTRIB

# --- SECURITY.md ---
write_if_absent "SECURITY.md" EOF_SECURITY <<EOF_SECURITY
# Security Policy

- Please report vulnerabilities privately to the maintainers.
- Do not open public issues for sensitive disclosures.
- Rotate credentials immediately if exposure is suspected.
EOF_SECURITY

# --- CODE_OF_CONDUCT.md (lightweight) ---
write_if_absent "CODE_OF_CONDUCT.md" EOF_COC <<EOF_COC
# Code of Conduct

Be respectful. Assume positive intent. No harassment or hate speech.
Escalate conflicts to maintainers if needed.
EOF_COC

# --- LICENSE (placeholder; choose one later) ---
write_if_absent "LICENSE" EOF_LICENSE <<EOF_LICENSE
TBD — choose a license (MIT/Apache-2.0/GPL-3.0). This placeholder prevents confusion.
EOF_LICENSE

# --- .nvmrc (team Node version) ---
write_if_absent ".nvmrc" EOF_NVM <<EOF_NVM
20
EOF_NVM

# --- apps/frontend/.env.example (public vars only) ---
write_if_absent "apps/frontend/.env.example" EOF_ENV_FE <<EOF_ENV_FE
# Only public variables (Vite/Next will expose NEXT_PUBLIC_/VITE_ prefixed keys)
VITE_API_BASE_URL=http://localhost:3000
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EOF_ENV_FE

# --- apps/backend/.env.example (secrets go in local/cI—never commit real secrets) ---
write_if_absent "apps/backend/.env.example" EOF_ENV_BE <<EOF_ENV_BE
DATABASE_URL=postgresql://studly:studly@localhost:5432/studly
PORT=3000
JWT_SECRET=changeme-in-local-only
EOF_ENV_BE

# --- docs/ADR/0001-monorepo-vs-polyrepo.md ---
write_if_absent "docs/ADR/0001-monorepo-vs-polyrepo.md" EOF_ADR1 <<EOF_ADR1
# ADR 0001: Monorepo vs Polyrepo

## Decision
Use a monorepo with \`apps/\` and \`packages/\`.

## Context
Single product, shared contracts/utilities, unified CI/CD.

## Consequences
+ Atomic changes, simpler cross-cutting refactors.
- Requires path-aware CI, workspace tooling.
EOF_ADR1

# --- .github Issue templates ---
write_if_absent ".github/ISSUE_TEMPLATE/bug_report.yml" EOF_BUG <<EOF_BUG
name: "🐞 Bug report"
description: Report a bug to help us improve
labels: ["bug"]
body:
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us what you expected to happen.
      placeholder: A clear and concise description of the bug.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: "1) Go to..., 2) Click..., 3) See error"
  - type: input
    id: env
    attributes:
      label: Environment
      placeholder: "OS, Browser/Node version, commit SHA"
  - type: textarea
    id: logs
    attributes:
      label: Logs/Screenshots
      render: shell
EOF_BUG

write_if_absent ".github/ISSUE_TEMPLATE/feature_request.yml" EOF_FEAT <<EOF_FEAT
name: "✨ Feature request"
description: Suggest an idea for Studly
labels: ["enhancement"]
body:
  - type: textarea
    id: summary
    attributes:
      label: Summary
      placeholder: What problem does this feature solve?
    validations:
      required: true
  - type: textarea
    id: details
    attributes:
      label: Details
      placeholder: User story, acceptance criteria, edge cases.
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
  - type: textarea
    id: screenshots
    attributes:
      label: Mockups/Screenshots (optional)
EOF_FEAT

write_if_absent ".github/ISSUE_TEMPLATE/config.yml" EOF_ITCFG <<EOF_ITCFG
blank_issues_enabled: false
contact_links:
  - name: Security disclosure
    url: https://example.com/security
    about: Please report security issues privately.
EOF_ITCFG

# --- Pull Request template ---
write_if_absent ".github/PULL_REQUEST_TEMPLATE.md" EOF_PR <<EOF_PR
## Summary
Explain the change and why it’s needed.

## Changes
- [ ] User-facing change?
- [ ] Breaking change?

## How to test
Steps or commands to verify this PR.

## Checklist
- [ ] Tests added/updated
- [ ] Lint/Typecheck pass locally
- [ ] Updated docs/ADR if needed
- [ ] No secrets committed
EOF_PR

# --- Minimal safe CI (non-breaking) ---
write_if_absent ".github/workflows/ci.yml" EOF_CI <<EOF_CI
name: CI
on:
  pull_request:
    branches: [ main ]
jobs:
  sanity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Node toolchain
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Print versions (placeholder)
        run: |
          node -v
          npm -v
      # TODO: replace with real workspace installs and per-app builds/tests later
EOF_CI

# --- Docs lint (optional, safe) ---
write_if_absent ".github/workflows/docs-check.yml" EOF_DOCS <<EOF_DOCS
name: Docs Check
on:
  pull_request:
    paths:
      - '**/*.md'
jobs:
  md-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Basic Markdown check
        run: |
          echo "Docs changed — remember to keep ADRs and README up to date."
EOF_DOCS

# --- Infra placeholders ---
write_if_absent "infra/docker/compose.dev.yml" EOF_COMPOSE <<EOF_COMPOSE
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: studly
      POSTGRES_PASSWORD: studly
      POSTGRES_DB: studly
    ports:
      - "5432:5432"
  backend:
    build:
      context: ../../apps/backend
    env_file:
      - ../../apps/backend/.env.local
    depends_on: [db]
    ports:
      - "3000:3000"
  frontend:
    build:
      context: ../../apps/frontend
    env_file:
      - ../../apps/frontend/.env.local
    ports:
      - "5173:5173"
EOF_COMPOSE

# --- Friendly README placeholders for app folders ---
write_if_absent "apps/frontend/README.md" EOF_FE_README <<EOF_FE_README
# Frontend (Vercel)
- Team: Frontend
- Framework: (e.g., Vite + React or Next.js)
- Start: \`pnpm dev\` (or framework command)
EOF_FE_README

write_if_absent "apps/backend/README.md" EOF_BE_README <<EOF_BE_README
# Backend (Railway)
- Team: Backend
- Stack: Node.js + Express/Fastify/Nest (choose one)
- Start: \`pnpm dev\` (or \`npm run dev\`)
- Health: GET /health → 200
EOF_BE_README

echo "✅ Scaffolding complete."
