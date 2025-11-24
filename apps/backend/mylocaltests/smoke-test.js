/**
 * Quick smoke test - runs all layers in sequence.
 * Use this to quickly verify the leaderboard API is working.
 */

import 'dotenv/config';
import { createLeaderboardService } from '../src/services/leaderboard.service.js';
import leaderboardRepository from '../src/repositories/leaderboard.repository.js';

const testUserId = '82a1c255-a826-474c-89d5-55b85e91f7c3';

async function smokeTest() {
  console.log('🔥 Leaderboard API Smoke Test\n');

  try {
    // Quick test
    const service = createLeaderboardService(leaderboardRepository);
    const result = await service.getLeaderboards(testUserId, 5);

    console.log('✓ API is working!');
    console.log(`✓ Friends study time entries: ${result.friends.studyTime.length}`);
    console.log(`✓ Friends badge entries: ${result.friends.badges.length}`);
    console.log(`✓ Global study time entries: ${result.global.studyTime.length}`);
    console.log(`✓ Global badge entries: ${result.global.badges.length}`);
    console.log(`✓ Response time: ${Date.now() - startTime}ms`);

    process.exit(0);
  } catch (error) {
    console.error('✗ API FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

const startTime = Date.now();
smokeTest();

