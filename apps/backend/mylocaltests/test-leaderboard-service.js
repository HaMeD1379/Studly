/**
 * Test the leaderboard service layer.
 * This tests the business logic and mapping functions.
 */

import 'dotenv/config';
import { createLeaderboardService } from '../src/services/leaderboard.service.js';
import leaderboardRepository from '../src/repositories/leaderboard.repository.js';

const service = createLeaderboardService(leaderboardRepository);

async function testService() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Testing Leaderboard Service Layer');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test with a sample user ID - replace with a real UUID from your database
  const testUserId = '82a1c255-a826-474c-89d5-55b85e91f7c3';

  try {
    console.log('1. Testing getLeaderboards with default limit (7)...');
    console.log(`   User ID: ${testUserId}`);

    const result = await service.getLeaderboards(testUserId, 7);

    console.log('   ✓ Service returned successfully!');
    console.log('\n   Response structure:');
    console.log('   ───────────────────────────────────────────────────────');
    console.log(JSON.stringify(result, null, 2));
    console.log('   ───────────────────────────────────────────────────────');

    console.log('\n   Metadata:');
    console.log(`   - Friends study time entries: ${result.friends.studyTime.length}`);
    console.log(`   - Friends badge entries: ${result.friends.badges.length}`);
    console.log(`   - Global study time entries: ${result.global.studyTime.length}`);
    console.log(`   - Global badge entries: ${result.global.badges.length}`);
    console.log(`   - Generated at: ${result.metadata.generatedAt}`);

  } catch (error) {
    console.error('   ✗ Error in getLeaderboards:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }

  try {
    console.log('\n2. Testing getLeaderboards with limit 3...');
    const result = await service.getLeaderboards(testUserId, 3);
    console.log('   ✓ Service returned successfully with limit 3!');
    console.log(`   - Friends study time entries: ${result.friends.studyTime.length}`);
    console.log(`   - Friends badge entries: ${result.friends.badges.length}`);
    console.log(`   - Global study time entries: ${result.global.studyTime.length}`);
    console.log(`   - Global badge entries: ${result.global.badges.length}`);

  } catch (error) {
    console.error('   ✗ Error in getLeaderboards (limit 3):');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Service tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run the tests
testService()
  .then(() => {
    console.log('\n✓ All service tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  });

