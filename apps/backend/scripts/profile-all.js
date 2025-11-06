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

async function requestEndpoint(method, endpointPath, requestBody, requestHeaders = {}) {
  const requestUrl = `${serverBaseUrl}${endpointPath}`;
  const response = await fetch(requestUrl, {
    method,
    headers: { 'Content-Type': 'application/json', ...requestHeaders },
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

async function main() {
  const authBasePath = '/api/v1/auth';

  await requestEndpoint('GET', '/health');
  await requestEndpoint('GET', '/');

  // Auth endpoints
  await requestEndpoint('POST', `${authBasePath}/signup`, {
    email: 'new@example.com',
    password: 'ValidPass123!',
    full_name: 'New User',
  });
  await requestEndpoint('POST', `${authBasePath}/login`, { email: 'user@example.com', password: 'Pass@1234' });
  await requestEndpoint('POST', `${authBasePath}/logout`);
  await requestEndpoint('POST', `${authBasePath}/forgot-password`, { email: 'user@example.com' });
  await requestEndpoint('POST', `${authBasePath}/reset-password?token=mock-token`, { newPassword: 'Strong@1234' });

  // Profile
  await requestEndpoint(
    'PATCH',
    '/api/v1/profile/update',
    { user_id: 'mock-id', full_name: 'Updated User', bio: 'Updated bio', refresh_token: 'r' },
    { authorization: 'Bearer a' },
  );

  // Sessions
  await requestEndpoint('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Math',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T01:00:00.000Z',
  });
  await requestEndpoint('PATCH', '/api/v1/sessions/session-1', {
    endTime: '2024-01-01T01:30:00.000Z',
    totalMinutes: 90,
  });
  await requestEndpoint('GET', '/api/v1/sessions?userId=user-1&subject=Math&limit=5');
  await requestEndpoint(
    'GET',
    '/api/v1/sessions/summary?userId=user-1&from=2024-01-01T00:00:00.000Z&to=2024-01-02T00:00:00.000Z',
  );

  // Badges (if wired)
  await requestEndpoint('GET', '/api/v1/badges');

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
}

await main();
