# Studly Backend — Testing Plan

This document explains how the backend tests are organized, how to run them locally and in CI, the naming conventions we enforce, and the optional coverage and profiling capabilities.

## Test runner

- We use Node's built-in test runner (node:test), orchestrated by a lightweight script at `tests/support/run-jest-lite.js`.
- The script discovers test files, optionally enables profiling, and can generate a V8-based coverage report (HTML and LCOV) without Jest.
- The `jest.config.js` file existed for historical reasons and has been removed; it isn’t used by the default `npm test` workflow in the backend app.

## File naming convention (strict)

- Test files must be lowercase and dot-separated, ending with `.test.js` or `.spec.js`.
  - Examples: `sessions.test.js`, `badges.service.test.js`
  - Disallowed: `authController.test.js`, `InitialBasicTest.js` (contains uppercase or non-standard style)
- The test discovery logic enforces this and will ignore files with uppercase characters in their filenames.

## Directory layout

- `tests/integration/` — Black-box tests that boot the Express server and drive HTTP requests end-to-end. Examples:
  - `auth.controller.test.js`
  - `profile.test.js`
  - `sessions.test.js`
- `tests/unit/` — Focused, isolated tests for controllers, services, middleware, repositories, and utilities. Examples:
  - `auth.validation.middleware.test.js`
  - `badges.service.test.js`
  - `sessions.service.test.js`
  - `server.utils.test.js`
- `tests/support/` — Utilities that support test execution (not test files):
  - `run-jest-lite.js` — custom orchestrator around node:test, coverage, and profiling
  - `profiler.hook.js` — optional V8 CPU/Heap profiling hook used when profiling is enabled

## How to run tests

From `apps/backend`:

- Run all tests (node:test via custom runner):

```
npm test
```

- Run with coverage (V8 native coverage; generates `apps/backend/coverage/`):

```
npm run test:coverage
```

- Run with profiling (writes CPU/heap profiles to `apps/backend/profiles/`):

```
set ENABLE_PROFILING=1 && npm test
```

Notes:
- The custom runner automatically prepends the profiling hook when profiling is enabled.
- Coverage includes only backend source files under `src/` (excluding entry points and config files) using a simple line-based approach.

## How to run the API profiler (endpoints)

Use this to profile the server while automatically exercising public API endpoints. Artifacts are written to `apps/backend/profiles/`.

- With npm scripts (run inside `apps/backend`):

```cmd
npm run profile:all
npm run profile:summarize
```

- Or directly with Node (run inside `apps/backend`):

```cmd
node scripts\profile-all.js
node scripts\summarize-timings.js
```

Artifacts produced:
- `profiles/backend.cpuprofile` — V8 CPU profile (open in Chrome DevTools Performance tab or VS Code profile viewer)
- `profiles/backend.heapprofile` — V8 heap sampling profile (open in Chrome DevTools Memory tab)
- `profiles/route-timings.json` — raw per-request timing data captured by middleware
- `profiles/route-timings-summary.json` — aggregated summary written by the summarize script; a console table is also printed

Notes:
- The profiler script sets `NODE_ENV=test`, `ENABLE_PROFILING=1`, and `STUDLY_USE_MOCK=1` so it uses the in-memory Supabase mock and bypasses the internal API key middleware. It boots the server on an ephemeral port, hits representative endpoints, then stops and writes artifacts.
- If your shell rejects `&&` (e.g., some PowerShell configurations), run the commands exactly as shown above in `cmd.exe`, or invoke the Node scripts directly.

## Test doubles and stubs

- Integration tests override the shared Supabase client in place (e.g., `supabase.from`, `supabase.auth.*`) and restore it after each test.
- Unit tests stub dependencies at module boundaries and validate controller/service behavior and error flows.

## CI expectations

- CI invokes `npm test` at `apps/backend`. No CI changes are necessary to run the suite.
- The enforced naming convention ensures new tests are discovered consistently.
- The `tests/support/` files are not tests themselves and are always excluded from discovery.

## Maintenance checklist

- Follow the lowercase dot-separated naming rule for all new tests.
- Prefer unit tests for small, focused logic; prefer integration tests when exercising HTTP routes or multi-layer flows.
- Keep support utilities generic and free of app logic.

## FAQ

- Why no Jest? We rely on node:test to keep the toolchain minimal; our custom runner fills in ergonomics like coverage and profiling.
- Where do coverage reports live? `apps/backend/coverage/` with `index.html` for a quick view and `lcov.info` for external tooling.
- How to profile flaky tests or performance? Use `set ENABLE_PROFILING=1 && npm test` and inspect files under `apps/backend/profiles/`.
