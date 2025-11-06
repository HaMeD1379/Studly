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
 *  • Sets NODE_ENV=test and ENABLE_PROFILING=1 to enable profiling and bypass
 *    internal API key middleware. Does NOT force STUDLY_USE_MOCK, so a real
 *    Supabase environment will be used when env vars are present.
 *  • Defers importing the app until env vars are set, then starts an inspector
 *    session and captures CPU and heap sampling profiles.
 *  • Hammers auth, profile, sessions, and badges endpoints with 100 requests
 *    each to generate realistic request load and timing entries.
 *  • Writes backend.cpuprofile and backend.heapprofile before closing the server
 *    to avoid Windows handle issues; timing JSON is emitted by middleware.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.ENABLE_PROFILING = process.env.ENABLE_PROFILING || '1';
// By default, profiling will use the real Supabase client if env vars are present.
// To force the mock client, set STUDLY_USE_MOCK=1 in your environment.

// Delay importing the app until after env vars are set
const { default: app } = await import('../src/index.js');
import inspector from 'node:inspector';
import { join, resolve, dirname } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const backendRootDir = resolve(dirname(__filename), '..');
const profilesDirectoryPath = join(backendRootDir, 'profiles');
mkdirSync(profilesDirectoryPath, { recursive: true });

function inspectorPost(inspectorSession, method, params = {}) {
  return new Promise((resolvePromise, reject) => {
    try {
      inspectorSession.post(method, params, (err, result) => {
        if (err) return reject(err);
        resolvePromise(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

const inspectorSession = new inspector.Session();
inspectorSession.connect();
await inspectorPost(inspectorSession, 'Profiler.enable');
await inspectorPost(inspectorSession, 'Profiler.start');
await inspectorPost(inspectorSession, 'HeapProfiler.enable');
await inspectorPost(inspectorSession, 'HeapProfiler.startSampling');

const httpServer = await new Promise((resolveServer) => {
  const serverInstance = app.listen(0, () => resolveServer(serverInstance));
});
const { port: ephemeralPort } = httpServer.address();
const serverBaseUrl = `http://127.0.0.1:${ephemeralPort}`;

const DEFAULT_API_KEY = process.env.INTERNAL_API_TOKEN || 'studly-local-token';

async function requestEndpoint(method, endpointPath, requestBody, requestHeaders = {}) {
  const requestUrl = `${serverBaseUrl}${endpointPath}`;
  const response = await fetch(requestUrl, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': DEFAULT_API_KEY, ...requestHeaders },
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  }).catch((error) => ({ status: 0, _error: error.message }));

  try {
    if (response && typeof response.text === 'function') {
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : undefined };
    }
  } catch (_parseError) {
    /* ignore parse errors */
  }
  return { status: response.status ?? 0, body: undefined };
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function hammerAuthEndpoints(iterations = 100) {
  const authBasePath = '/api/v1/auth';
  const baseEmail = 'loadtest-user';
  const domain = (process.env.AUTH_TEST_DOMAIN || 'example.com').replace(/^@/, '');

  for (let i = 0; i < iterations; i++) {
    const uniqueEmail = `${baseEmail}+${Date.now()}_${i}@${domain}`;

    await requestEndpoint('POST', `${authBasePath}/signup`, {
      email: uniqueEmail,
      password: 'ValidPass123!',
      full_name: `Load User ${i}`,
    });

    // Attempt login with the same email
    await requestEndpoint('POST', `${authBasePath}/login`, {
      email: uniqueEmail,
      password: 'ValidPass123!',
    });

    await requestEndpoint('POST', `${authBasePath}/logout`);

    await requestEndpoint('POST', `${authBasePath}/forgot-password`, { email: uniqueEmail });

    await requestEndpoint('POST', `${authBasePath}/reset-password?token=mock-token`, {
      newPassword: 'Strong@1234',
    });

    if (i % 10 === 0) await delay(20);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shiftMinutes(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

async function hammerProfileEndpoint(iterations = 100) {
  for (let i = 0; i < iterations; i++) {
    // Only update bio to avoid requiring a valid Supabase Auth session
    await requestEndpoint(
      'PATCH',
      '/api/v1/profile/update',
      {
        user_id: `user-${i % 5}`,
        bio: `Load test bio ${i}`,
      }
    );

    if (i % 10 === 0) await delay(10);
  }
}

async function hammerSessionsEndpoints(iterations = 100) {
  // For each iteration, create a session, GET it by list/summary, then patch it
  for (let i = 0; i < iterations; i++) {
    const baseStart = new Date('2024-01-01T00:00:00.000Z');
    const start = new Date(baseStart.getTime() + i * 60_000);
    const end = new Date(start.getTime() + randomInt(30, 120) * 60_000);
    const userId = `user-${(i % 7) + 1}`;

    // 1) CREATE — POST /api/v1/sessions
    const createRes = await requestEndpoint('POST', '/api/v1/sessions', {
      userId,
      subject: ['Math', 'Physics', 'Chemistry', 'Biology'][i % 4],
      sessionType: (i % 3) + 1,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      sessionGoal: i % 2 === 0 ? 'Study chapters' : null,
    });

    const createdId = createRes?.body?.session?.id;

    // 2) GET LIST — /api/v1/sessions?userId=...
    await requestEndpoint('GET', `/api/v1/sessions?userId=${encodeURIComponent(userId)}&limit=5`);

    // 3) GET SUMMARY — /api/v1/sessions/summary?userId=...&from=...&to=...
    await requestEndpoint(
      'GET',
      `/api/v1/sessions/summary?userId=${encodeURIComponent(userId)}&from=${encodeURIComponent('2024-01-01T00:00:00.000Z')}&to=${encodeURIComponent('2024-01-02T00:00:00.000Z')}`,
    );

    // 4) PATCH CREATED — /api/v1/sessions/:id (if created)
    if (createdId) {
      await requestEndpoint('PATCH', `/api/v1/sessions/${createdId}`, {
        endTime: shiftMinutes(end.toISOString(), randomInt(5, 30)),
        totalMinutes: null, // compute on server
      });
    } else {
      // Fallback: still exercise patch path
      await requestEndpoint('PATCH', `/api/v1/sessions/nonexistent-${i}`, {
        totalMinutes: 90,
      });
    }


    if (i % 10 === 0) await delay(10);
  }
}

async function hammerBadgesEndpoint(iterations = 100) {
  for (let i = 0; i < iterations; i++) {
    await requestEndpoint('GET', '/api/v1/badges');
    if (i % 20 === 0) await delay(5);
  }
}

async function main() {
  // Warmup
  await requestEndpoint('GET', '/health');
  await requestEndpoint('GET', '/');

  // Auth endpoints (100x)
  await hammerAuthEndpoints(100);

  // Profile
  await hammerProfileEndpoint(100);

  // Sessions
  await hammerSessionsEndpoints(100);

  // Badges
  await hammerBadgesEndpoint(100);

  // Stop profilers and write artifacts BEFORE closing the server to avoid Windows handle issues
  try {
    const cpuProfileResult = await inspectorPost(inspectorSession, 'Profiler.stop');
    if (cpuProfileResult?.profile) {
      writeFileSync(join(profilesDirectoryPath, 'backend.cpuprofile'), JSON.stringify(cpuProfileResult.profile));
    }
  } catch (_error) {
    /* ignore CPU profiler stop errors */
  }
  try {
    const heapProfileResult = await inspectorPost(inspectorSession, 'HeapProfiler.stopSampling');
    if (heapProfileResult?.profile) {
      writeFileSync(join(profilesDirectoryPath, 'backend.heapprofile'), JSON.stringify(heapProfileResult.profile));
    }
  } catch (_error) {
    /* ignore heap profiler stop errors */
  }
  try {
    inspectorSession.disconnect();
  } catch (_error) {
    /* ignore disconnect errors */
  }

  await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
  await new Promise((resolveClose, rejectClose) =>
    httpServer.close((error) => (error ? rejectClose(error) : resolveClose())),
  );

  // Ensure process exit so profiling middleware flushes route timings to disk
  process.exit(0);
}

await main();
