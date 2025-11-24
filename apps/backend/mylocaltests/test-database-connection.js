/**
 * Check database connection and basic queries.
 * This verifies that Supabase client is configured correctly.
 */

import 'dotenv/config';
import supabase from '../src/config/supabase.client.js';

async function testDatabaseConnection() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Testing Database Connection and Basic Queries');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Environment check:');
  console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]'}`);
  console.log(`  SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]'}`);
  console.log(`  STUDLY_USE_MOCK: ${process.env.STUDLY_USE_MOCK || '[NOT SET]'}`);
  console.log('');

  try {
    console.log('1. Testing sessions table query...');
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionError) {
      console.error('   ✗ Error querying sessions table:');
      console.error('   ', sessionError.message);
    } else {
      console.log('   ✓ Sessions table accessible');
      console.log(`   Found ${sessionData?.length || 0} rows (limited to 1)`);
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception querying sessions:');
    console.error('   ', error.message);
    console.log('');
  }

  try {
    console.log('2. Testing user_profile table query...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('   ✗ Error querying user_profile table:');
      console.error('   ', profileError.message);
    } else {
      console.log('   ✓ user_profile table accessible');
      console.log(`   Found ${profileData?.length || 0} rows (limited to 1)`);
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception querying user_profile:');
    console.error('   ', error.message);
    console.log('');
  }

  try {
    console.log('3. Testing user_badge table query...');
    const { data: badgeData, error: badgeError } = await supabase
      .from('user_badge')
      .select('*')
      .limit(1);

    if (badgeError) {
      console.error('   ✗ Error querying user_badge table:');
      console.error('   ', badgeError.message);
    } else {
      console.log('   ✓ user_badge table accessible');
      console.log(`   Found ${badgeData?.length || 0} rows (limited to 1)`);
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception querying user_badge:');
    console.error('   ', error.message);
    console.log('');
  }

  try {
    console.log('4. Testing friends table query...');
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .limit(1);

    if (friendsError) {
      console.error('   ✗ Error querying friends table:');
      console.error('   ', friendsError.message);
    } else {
      console.log('   ✓ friends table accessible');
      console.log(`   Found ${friendsData?.length || 0} rows (limited to 1)`);
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception querying friends:');
    console.error('   ', error.message);
    console.log('');
  }

  try {
    console.log('5. Testing join query (sessions + user_profile)...');
    const { data: joinData, error: joinError } = await supabase
      .from('sessions')
      .select('user_id, total_time, user_profile!inner(bio)')
      .limit(1);

    if (joinError) {
      console.error('   ✗ Error with join query:');
      console.error('   ', joinError.message);
      console.error('   This could be the issue! Check foreign key relationships.');
    } else {
      console.log('   ✓ Join query successful');
      console.log(`   Found ${joinData?.length || 0} rows`);
      if (joinData && joinData.length > 0) {
        console.log('   Sample row:', JSON.stringify(joinData[0], null, 2));
      }
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception with join query:');
    console.error('   ', error.message);
    console.log('');
  }

  try {
    console.log('6. Testing join query (user_badge + user_profile)...');
    const { data: joinData2, error: joinError2 } = await supabase
      .from('user_badge')
      .select('user_id, user_profile!inner(bio)')
      .limit(1);

    if (joinError2) {
      console.error('   ✗ Error with user_badge join query:');
      console.error('   ', joinError2.message);
      console.error('   This could be the issue! Check foreign key relationships.');
    } else {
      console.log('   ✓ user_badge Join query successful');
      console.log(`   Found ${joinData2?.length || 0} rows`);
      if (joinData2 && joinData2.length > 0) {
        console.log('   Sample row:', JSON.stringify(joinData2[0], null, 2));
      }
    }
    console.log('');

  } catch (error) {
    console.error('   ✗ Exception with user_badge join query:');
    console.error('   ', error.message);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Database connection tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run the tests
testDatabaseConnection()
  .then(() => {
    console.log('\n✓ All database tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  });

