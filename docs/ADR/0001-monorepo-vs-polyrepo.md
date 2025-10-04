# ADR 0001: Monorepo vs Polyrepo

## Decision
Use a monorepo with `apps/` and `packages/`.

## Context
Single product, shared contracts/utilities, unified CI/CD.

## Consequences
+ Atomic changes, simpler cross-cutting refactors.
- Requires path-aware CI, workspace tooling.
