/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: apps/backend/scripts/profile-all.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Prompter & Design: Hamed Esmaeilzadeh
 *  Implementer & Commenter: ChatGPT
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Boots the Express app on an ephemeral port and exercises representative API
 *  endpoints to produce CPU/heap profiles via Node's inspector and per-route
 *  timing data via a lightweight timing middleware. Artifacts are written under
 *  apps/backend/profiles/ for inspection (Chrome DevTools, etc.).
 *
 *  Implementation Notes
 *  --------------------
 *  • Sets NODE_ENV=test, ENABLE_PROFILING=1, STUDLY_USE_MOCK=1 to avoid external
 *    dependencies and auth barriers while profiling.
 *  • Defers importing the app until env vars are set, then starts an inspector
 *    session and captures CPU and heap sampling profiles.
 *  • Hits auth, profile, sessions, and badges endpoints using fetch to generate
 *    realistic request load and route timing entries.
 *  • Writes backend.cpuprofile and backend.heapprofile before closing the server
 *    to avoid Windows handle issues; timing JSON is emitted by middleware.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.ENABLE_PROFILING = process.env.ENABLE_PROFILING || '1';
process.env.STUDLY_USE_MOCK = process.env.STUDLY_USE_MOCK || '1';

// Delay importing the app until after env vars are set
const { default: app } = await import('../src/index.js');
import inspector from 'node:inspector';
import { join, resolve, dirname } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(__filename), '..');
const profilesDir = join(projectRoot, 'profiles');
mkdirSync(profilesDir, { recursive: true });

function postAsync(session, method, params = {}) {
  return new Promise((resolvePromise, reject) => {
    try {
      session.post(method, params, (err, result) => {
        if (err) return reject(err);
        resolvePromise(result);
      });
    } catch (e) { reject(e); }
  });
}

const session = new inspector.Session();
session.connect();
await postAsync(session, 'Profiler.enable');
await postAsync(session, 'Profiler.start');
await postAsync(session, 'HeapProfiler.enable');
await postAsync(session, 'HeapProfiler.startSampling');

const server = await new Promise((resolve) => {
  const s = app.listen(0, () => resolve(s));
});
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function hit(method, path, body, headers = {}) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((e) => ({ status: 0, _error: e.message }));

  try {
    if (res && typeof res.text === 'function') {
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : undefined };
    }
  } catch (_e) { /* ignore parse errors */ }
  return { status: res.status ?? 0, body: undefined };
}

async function main() {
  const auth = '/api/v1/auth';

  await hit('GET', '/health');
  await hit('GET', '/');

  // Auth endpoints
  await hit('POST', `${auth}/signup`, { email: 'new@example.com', password: 'ValidPass123!', full_name: 'New User' });
  await hit('POST', `${auth}/login`, { email: 'user@example.com', password: 'Pass@1234' });
  await hit('POST', `${auth}/logout`);
  await hit('POST', `${auth}/forgot-password`, { email: 'user@example.com' });
  await hit('POST', `${auth}/reset-password?token=mock-token`, { newPassword: 'Strong@1234' });

  // Profile
  await hit('PATCH', '/api/v1/profile/update', { user_id: 'mock-id', full_name: 'Updated User', bio: 'Updated bio', refresh_token: 'r', }, { authorization: 'Bearer a' });

  // Sessions
  await hit('POST', '/api/v1/sessions', { userId: 'user-1', subject: 'Math', sessionType: 1, startTime: '2024-01-01T00:00:00.000Z', endTime: '2024-01-01T01:00:00.000Z' });
  await hit('PATCH', '/api/v1/sessions/session-1', { endTime: '2024-01-01T01:30:00.000Z', totalMinutes: 90 });
  await hit('GET', '/api/v1/sessions?userId=user-1&subject=Math&limit=5');
  await hit('GET', '/api/v1/sessions/summary?userId=user-1&from=2024-01-01T00:00:00.000Z&to=2024-01-02T00:00:00.000Z');

  // Badges (if wired)
  await hit('GET', '/api/v1/badges');

  // Stop profilers and write artifacts BEFORE closing the server to avoid Windows handle issues
  try {
    const cpu = await postAsync(session, 'Profiler.stop');
    if (cpu?.profile) {
      writeFileSync(join(profilesDir, 'backend.cpuprofile'), JSON.stringify(cpu.profile));
    }
  } catch (_e) { /* ignore CPU profiler stop errors */ }
  try {
    const heap = await postAsync(session, 'HeapProfiler.stopSampling');
    if (heap?.profile) {
      writeFileSync(join(profilesDir, 'backend.heapprofile'), JSON.stringify(heap.profile));
    }
  } catch (_e) { /* ignore heap profiler stop errors */ }
  try { session.disconnect(); } catch (_e) { /* ignore disconnect errors */ }

  await new Promise((r) => setTimeout(r, 50));
  await new Promise((resolveClose, rejectClose) => server.close((e) => (e ? rejectClose(e) : resolveClose())));
}

await main();
