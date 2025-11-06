/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: apps/backend/scripts/summarize-timings.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Prompter & Design: Hamed Esmaeilzadeh
 *  Implementer & Commenter: ChatGPT
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Reads raw per-route timing data produced by the profiling middleware and
 *  aggregates it by endpoint, producing count, average, p95, and max latency
 *  metrics. Outputs a JSON summary and a console table for quick inspection.
 *
 *  Implementation Notes
 *  --------------------
 *  • Input: profiles/route-timings.json; Output: profiles/route-timings-summary.json
 *  • Computes percentiles from sorted duration arrays; guards against empty sets.
 *  • Uses process.cwd() to respect invocation from apps/backend.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const routeTimingsPath = join(process.cwd(), 'profiles', 'route-timings.json');
const summaryOutputPath = join(process.cwd(), 'profiles', 'route-timings-summary.json');

function computePercentile(sortedDurations, percentileValue) {
  if (sortedDurations.length === 0) return 0;
  const index = Math.min(
    sortedDurations.length - 1,
    Math.floor((percentileValue / 100) * sortedDurations.length),
  );
  return sortedDurations[index];
}

function main() {
  let timingRecords = [];
  try {
    timingRecords = JSON.parse(readFileSync(routeTimingsPath, 'utf8'));
  } catch (error) {
    console.error('Could not read timings:', error.message);
    process.exit(1);
  }

  const durationsByEndpoint = new Map();
  for (const record of timingRecords) {
    const endpointKey = `${record.method} ${record.route}`;
    const endpointBucket =
      durationsByEndpoint.get(endpointKey) || { method: record.method, route: record.route, durations: [] };
    endpointBucket.durations.push(Number(record.duration_ms) || 0);
    durationsByEndpoint.set(endpointKey, endpointBucket);
  }

  const endpointSummaries = Array.from(durationsByEndpoint.values())
    .map((endpoint) => {
      const sortedDurations = endpoint.durations.slice().sort((a, b) => a - b);
      const totalDuration = sortedDurations.reduce((sum, current) => sum + current, 0);
      const averageDuration = sortedDurations.length ? totalDuration / sortedDurations.length : 0;
      return {
        method: endpoint.method,
        route: endpoint.route,
        // Number of samples collected for this endpoint
        count: sortedDurations.length,
        avg_ms: Math.round(averageDuration * 1000) / 1000,
        p95_ms: Math.round(computePercentile(sortedDurations, 95) * 1000) / 1000,
        max_ms:
          Math.round((sortedDurations.length ? sortedDurations[sortedDurations.length - 1] : 0) * 1000) / 1000,
      };
    })
    .sort((left, right) => right.max_ms - left.max_ms);

  writeFileSync(
    summaryOutputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), endpoints: endpointSummaries }, null, 2),
  );
  console.log('Wrote', summaryOutputPath);
  console.table(endpointSummaries.slice(0, 10));
}

main();
