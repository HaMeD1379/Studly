/**
 * Direct test of leaderboard repository functions.
 * This bypasses the service and controller layers to test database queries directly.
 */

import 'dotenv/config';
import { createLeaderboardRepository } from '../src/repositories/leaderboard.repository.js';
import supabase from '../src/config/supabase.client.js';

const repository = createLeaderboardRepository(supabase);

async function testRepository() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Testing Leaderboard Repository Functions');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test with a sample user ID - replace with a real UUID from your database
  const testUserId = '82a1c255-a826-474c-89d5-55b85e91f7c3';

  try {
    console.log('1. Testing findAcceptedFriendsForUser...');
    console.log(`   User ID: ${testUserId}`);
    const friends = await repository.findAcceptedFriendsForUser(testUserId);
    console.log(`   ✓ Found ${friends.length} friends:`);
    console.log('   ', JSON.stringify(friends, null, 2));
    console.log('');

  } catch (error) {
    console.error('   ✗ Error in findAcceptedFriendsForUser:');
    console.error('   ', error.message);
    console.error('   ', error.stack);
    console.log('');
  }

  try {
    console.log('2. Testing findStudyTimeLeaderboard (global)...');
    const studyTimeGlobal = await repository.findStudyTimeLeaderboard({
      userIds: null,
      limit: 7,
      ensureUserId: testUserId
    });
    console.log(`   ✓ Found ${studyTimeGlobal.length} study time entries:`);
    console.log('   ', JSON.stringify(studyTimeGlobal, null, 2));
    console.log('');

  } catch (error) {
    console.error('   ✗ Error in findStudyTimeLeaderboard (global):');
    console.error('   ', error.message);
    console.error('   ', error.stack);
    console.log('');
  }

  try {
    console.log('3. Testing findBadgeCountLeaderboard (global)...');
    const badgeCountGlobal = await repository.findBadgeCountLeaderboard({
      userIds: null,
      limit: 7,
      ensureUserId: testUserId
    });
    console.log(`   ✓ Found ${badgeCountGlobal.length} badge count entries:`);
    console.log('   ', JSON.stringify(badgeCountGlobal, null, 2));
    console.log('');

  } catch (error) {
    console.error('   ✗ Error in findBadgeCountLeaderboard (global):');
    console.error('   ', error.message);
    console.error('   ', error.stack);
    console.log('');
  }

  try {
    console.log('4. Testing findStudyTimeLeaderboard (friends only)...');
    const studyTimeFriends = await repository.findStudyTimeLeaderboard({
      userIds: [testUserId],
      limit: 7
    });
    console.log(`   ✓ Found ${studyTimeFriends.length} study time entries (friends):`);
    console.log('   ', JSON.stringify(studyTimeFriends, null, 2));
    console.log('');

  } catch (error) {
    console.error('   ✗ Error in findStudyTimeLeaderboard (friends):');
    console.error('   ', error.message);
    console.error('   ', error.stack);
    console.log('');
  }

  try {
    console.log('5. Testing findBadgeCountLeaderboard (friends only)...');
    const badgeCountFriends = await repository.findBadgeCountLeaderboard({
      userIds: [testUserId],
      limit: 7
    });
    console.log(`   ✓ Found ${badgeCountFriends.length} badge count entries (friends):`);
    console.log('   ', JSON.stringify(badgeCountFriends, null, 2));
    console.log('');

  } catch (error) {
    console.error('   ✗ Error in findBadgeCountLeaderboard (friends):');
    console.error('   ', error.message);
    console.error('   ', error.stack);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Repository tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run the tests
testRepository()
  .then(() => {
    console.log('\n✓ All repository tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  });

