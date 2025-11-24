/**
 * Helper script to find a valid user ID for testing.
 */

import 'dotenv/config';
import supabase from '../src/config/supabase.client.js';

async function findTestUserId() {
  console.log('Finding a valid user ID for testing...\n');

  try {
    // Try to find a user with sessions
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .not('end_time', 'is', null)
      .limit(1);

    if (!sessionError && sessionData && sessionData.length > 0) {
      console.log('✓ Found user with sessions:');
      console.log(`  User ID: ${sessionData[0].user_id}`);
      return sessionData[0].user_id;
    }

    // Try user_profile table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .select('user_id')
      .limit(1);

    if (!profileError && profileData && profileData.length > 0) {
      console.log('✓ Found user in user_profile:');
      console.log(`  User ID: ${profileData[0].user_id}`);
      return profileData[0].user_id;
    }

    console.log('✗ No users found in database');
    return null;

  } catch (error) {
    console.error('Error finding user:', error.message);
    return null;
  }
}

findTestUserId()
  .then((userId) => {
    if (userId) {
      console.log('\nCopy this user ID into the test scripts:');
      console.log(`const testUserId = '${userId}';`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

