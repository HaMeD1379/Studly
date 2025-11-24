/**
 * Test the leaderboard API endpoint via HTTP request.
 * This simulates how the frontend calls the API.
 */

import 'dotenv/config';
import app from '../src/index.js';

async function testEndpoint() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Testing Leaderboard API Endpoint via Express App');
  console.log('═══════════════════════════════════════════════════════════\n');

  const testUserId = 'c7040572-784a-40ab-819d-1267f8a95eae';
  const apiKey = process.env.INTERNAL_API_TOKEN || 'test-key';

  // Simulate an HTTP request using supertest-like approach
  const request = {
    method: 'GET',
    url: `/api/v1/leaderboard?userId=${testUserId}&limit=7`,
    headers: {
      'x-internal-api-key': apiKey
    }
  };

  console.log('Request details:');
  console.log(`  Method: ${request.method}`);
  console.log(`  URL: ${request.url}`);
  console.log(`  Headers: x-internal-api-key: ${apiKey ? '[PRESENT]' : '[MISSING]'}`);
  console.log('');

  // Create a mock response object
  let statusCode;
  let responseBody;
  let responseHeaders = {};

  const mockRes = {
    status: function(code) {
      statusCode = code;
      return this;
    },
    json: function(data) {
      responseBody = data;
      return this;
    },
    send: function(data) {
      responseBody = data;
      return this;
    },
    set: function(header, value) {
      responseHeaders[header] = value;
      return this;
    }
  };

  const mockReq = {
    method: 'GET',
    url: request.url,
    headers: request.headers,
    query: {
      userId: testUserId,
      limit: '7'
    }
  };

  try {
    // Import the controller directly
    const { getLeaderboard } = await import('../src/controllers/leaderboard.controller.js');

    console.log('Calling controller directly...\n');

    const nextCalled = [];
    const mockNext = (error) => {
      nextCalled.push(error);
    };

    await getLeaderboard(mockReq, mockRes, mockNext);

    if (nextCalled.length > 0) {
      console.error('✗ Controller called next() with error:');
      console.error('   Message:', nextCalled[0]?.message);
      console.error('   Stack:', nextCalled[0]?.stack);
      console.error('');
    }

    console.log('Response:');
    console.log(`  Status: ${statusCode || 'NOT SET'}`);
    console.log(`  Body:`);
    console.log(JSON.stringify(responseBody, null, 2));
    console.log('');

    if (statusCode === 200) {
      console.log('✓ API endpoint returned 200 OK');
    } else if (statusCode === 400) {
      console.log('⚠ API endpoint returned 400 Bad Request');
      console.log('  This might be a validation issue');
    } else if (statusCode === 500) {
      console.log('✗ API endpoint returned 500 Internal Server Error');
      console.log('  Check the error details above');
    } else {
      console.log(`? API endpoint returned status ${statusCode}`);
    }

  } catch (error) {
    console.error('✗ Fatal error during endpoint test:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Endpoint test complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run the test
testEndpoint()
  .then(() => {
    console.log('\n✓ Endpoint test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error:');
    console.error(error);
    process.exit(1);
  });

