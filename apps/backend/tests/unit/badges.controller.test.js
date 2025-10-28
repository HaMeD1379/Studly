import test from 'node:test';
import assert from 'node:assert/strict';
import { createBadgesController } from '../../src/controllers/badges.controller.js';
import STRINGS from '../../src/config/strings.js';

// Mock service
const createMockService = () => {
  return {
    getAllBadges: async () => [
      { id: '1', name: 'First Steps' }
    ],
    getUserBadges: async (userId) => [
      { userId, badgeId: '1', progress: 100 }
    ],
    awardBadge: async (userId, badgeId) => {
      if (badgeId === 'existing') {
        throw new Error('BADGE_ALREADY_EARNED');
      }
      return { userId, badgeId, earned_at: new Date() };
    },
    checkAndAwardBadges: async (userId) => [
      { userId, badgeId: '2', earned_at: new Date() }
    ]
  };
};

// Mock response object
const createMockResponse = () => {
  const calls = { status: [], json: [] };
  return {
    calls,
    status(code) {
      calls.status.push(code);
      return this;
    },
    json(payload) {
      calls.json.push(payload);
      return payload;
    }
  };
};

test(STRINGS.TEST.BADGES_CONTROLLER_GET_ALL, async () => {
  const mockService = createMockService();
  const controller = createBadgesController(mockService);
  const mockRes = createMockResponse();
  const mockNext = (error) => assert.fail('Should not call next with error');
  
  await controller.getAllBadges({}, mockRes, mockNext);
  
  assert.deepStrictEqual(mockRes.calls.status, [200]);
  assert.equal(mockRes.calls.json[0].badges.length, 1);
  assert.equal(mockRes.calls.json[0].badges[0].name, 'First Steps');
});

test(STRINGS.TEST.BADGES_CONTROLLER_USER_BADGES, async () => {
  const mockService = createMockService();
  const controller = createBadgesController(mockService);
  const mockRes = createMockResponse();
  const mockNext = (error) => assert.fail('Should not call next with error');
  const mockReq = {
    validated: { userId: 'user123', includeProgress: true }
  };
  
  await controller.getUserBadges(mockReq, mockRes, mockNext);
  
  assert.deepStrictEqual(mockRes.calls.status, [200]);
  assert.equal(mockRes.calls.json[0].badges.length, 1);
  assert.equal(mockRes.calls.json[0].badges[0].userId, 'user123');
});

test(STRINGS.TEST.BADGES_CONTROLLER_AWARD, async () => {
  const mockService = createMockService();
  const controller = createBadgesController(mockService);
  const mockRes = createMockResponse();
  let nextCalled = false;
  const mockNext = (error) => { nextCalled = true; };
  
  // Test successful award
  const mockReq = {
    validated: { userId: 'user123', badgeId: 'badge1' }
  };
  
  await controller.awardBadge(mockReq, mockRes, mockNext);
  
  assert.deepStrictEqual(mockRes.calls.status, [201]);
  assert.ok(mockRes.calls.json[0].userBadge.earned_at);
  
  // Test already earned badge
  const mockRes2 = createMockResponse();
  const mockReq2 = {
    validated: { userId: 'user123', badgeId: 'existing' }
  };
  
  await controller.awardBadge(mockReq2, mockRes2, mockNext);
  
  assert.deepStrictEqual(mockRes2.calls.status, [409]);
  assert.equal(mockRes2.calls.json[0].error, 'Badge already earned by user');
});