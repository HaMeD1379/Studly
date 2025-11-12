/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/support/profiler.hook.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly (Backend)
 *  Author: Team 3
 *  Assisted-by: ChatGPT for comments and documentation
 *  Last-Updated: 2025-11-05
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Enables CPU and Heap profiling when ENABLE_PROFILING=1 by attaching an
 *  inspector session at process start and flushing artifacts on exit to the
 *  apps/backend/profiles directory. This integrates seamlessly with the custom
 *  test runner.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import inspector from 'node:inspector';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(__filename), '..', '..');
const profilesDir = join(projectRoot, 'profiles');

function enabled() {
  return process.env.ENABLE_PROFILING === '1';
}

let session;

function startProfiling() {
  mkdirSync(profilesDir, { recursive: true });
  session = new inspector.Session();
  session.connect();
  session.post('Profiler.enable');
  session.post('Profiler.start');
  session.post('HeapProfiler.enable');
  session.post('HeapProfiler.startSampling');
}

function stopProfilingAndWrite() {
  if (!session) return;
  try {
    session.post('Profiler.stop', (err, { profile } = {}) => {
      if (!err && profile) {
        try { writeFileSync(join(profilesDir, 'backend.cpuprofile'), JSON.stringify(profile)); } catch (e) { /* ignore */ }
      }
    });
    session.post('HeapProfiler.stopSampling', (err, { profile } = {}) => {
      if (!err && profile) {
        try { writeFileSync(join(profilesDir, 'backend.heapprofile'), JSON.stringify(profile)); } catch (e) { /* ignore */ }
      }
    });
  } catch (e) {
    // ignore
  }
}

if (enabled()) {
  startProfiling();
  process.on('beforeExit', stopProfilingAndWrite);
  process.on('exit', stopProfilingAndWrite);
}
