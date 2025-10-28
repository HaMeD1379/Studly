import test from 'node:test';
import assert from 'node:assert/strict';
import { createBadgesRepository } from '../../src/repositories/badges.repository.js';
import STRINGS from '../../src/config/strings.js';

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockData = {
    badge: [
      { 
        badge_id: '1', 
        name: 'First Steps', 
        category: 'milestone', 
        criteria_type: 'session_count',
        threshold: 1,
        description: 'Complete your first session',
        icon_url: '/icons/first-steps.png',
        created_at: '2025-01-01T00:00:00Z'
      },
      { 
        badge_id: '2', 
        name: 'Week Warrior', 
        category: 'streak', 
        criteria_type: 'consecutive_days',
        threshold: 7,
        description: 'Study 7 days in a row',
        icon_url: '/icons/week-warrior.png',
        created_at: '2025-01-01T00:00:00Z'
      }
    ],
    user_badge: [
      { 
        user_id: 'user123', 
        badge_id: '1', 
        earned_at: '2025-01-15T10:00:00Z',
        badge: { 
          badge_id: '1', 
          name: 'First Steps',
          description: 'Complete your first session',
          icon_url: '/icons/first-steps.png',
          category: 'milestone',
          criteria_type: 'session_count',
          threshold: 1,
          created_at: '2025-01-01T00:00:00Z'
        }
      }
    ],
    sessions: [
      { 
        user_id: 'user123', 
        date: '2025-01-15', 
        total_time: 60, 
        end_time: '2025-01-15T11:00:00Z' 
      }
    ]
  };

  return {
    from: (table) => {
      const queryBuilder = {
        _table: table,
        _filters: [],
        _orderBy: null,
        _single: false,
        _maybeSingle: false,
        
        select: function(columns) {
          this._columns = columns;
          return this;
        },
        
        eq: function(column, value) {
          this._filters.push({ column, op: 'eq', value });
          return this;
        },
        
        gte: function(column, value) {
          this._filters.push({ column, op: 'gte', value });
          return this;
        },
        
        not: function(column, op, value) {
          this._filters.push({ column, op: 'not_' + op, value });
          return this;
        },
        
        order: function(column, options) {
          this._orderBy = { column, ...options };
          return this;
        },
        
        single: function() {
          this._single = true;
          return this;
        },
        
        maybeSingle: function() {
          this._maybeSingle = true;
          return this;
        },
        
        insert: function(data) {
          this._insertData = data;
          this._operation = 'insert';
          return this;
        },
        
        update: function(data) {
          this._updateData = data;
          this._operation = 'update';
          return this;
        },
        
        upsert: function(data, options) {
          this._upsertData = data;
          this._upsertOptions = options;
          this._operation = 'upsert';
          return this;
        }
      };
      
      // Make it a proper thenable/promise
      queryBuilder.then = async function(resolve, reject) {
        try {
          // Simulate async behavior
          await new Promise(r => setImmediate(r));
          
          let result = { data: null, error: null };
          
          if (this._operation === 'insert') {
            result.data = { ...this._insertData };
          } else if (this._operation === 'update') {
            result.data = { badge_id: 'ub1', ...this._updateData };
          } else if (this._operation === 'upsert') {
            result.data = { ...this._upsertData };
          } else if (this._table === 'badge') {
            result.data = [...mockData.badge];
          } else if (this._table === 'user_badge') {
            const userFilter = this._filters.find(f => f.column === 'user_id');
            const badgeFilter = this._filters.find(f => f.column === 'badge_id');
            
            if (userFilter && badgeFilter) {
              // Finding specific user badge
              result.data = mockData.user_badge.find(
                ub => ub.user_id === userFilter.value && ub.badge_id === badgeFilter.value
              ) || null;
            } else if (userFilter) {
              result.data = mockData.user_badge.filter(ub => ub.user_id === userFilter.value);
            } else {
              result.data = [...mockData.user_badge];
            }
          } else if (this._table === 'sessions') {
            const userFilter = this._filters.find(f => f.column === 'user_id');
            if (userFilter) {
              result.data = mockData.sessions.filter(s => s.user_id === userFilter.value);
            } else {
              result.data = [...mockData.sessions];
            }
          }
          
          if (this._single && Array.isArray(result.data)) {
            result.data = result.data[0] || null;
            if (!result.data) {
              result.error = { code: 'PGRST116', message: 'Not found' };
            }
          }
          
          if (this._maybeSingle && Array.isArray(result.data)) {
            result.data = result.data[0] || null;
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      return queryBuilder;
    }
  };
};

test(STRINGS.TEST.BADGES_REPOSITORY_FIND_ALL, async () => {
  const mockClient = createMockSupabaseClient();
  const repository = createBadgesRepository(mockClient);
  
  const badges = await repository.findAllBadges();
  
  assert.equal(badges.length, 2);
  assert.equal(badges[0].name, 'First Steps');
  assert.equal(badges[1].name, 'Week Warrior');
});

test(STRINGS.TEST.BADGES_REPOSITORY_USER_BADGES, async () => {
  const mockClient = createMockSupabaseClient();
  const repository = createBadgesRepository(mockClient);
  
  const userBadges = await repository.findUserBadges('user123');
  
  assert.equal(userBadges.length, 1);
  assert.equal(userBadges[0].user_id, 'user123');
  assert.equal(userBadges[0].badge.name, 'First Steps');
});

test(STRINGS.TEST.BADGES_REPOSITORY_CREATE, async () => {
  const mockClient = createMockSupabaseClient();
  const repository = createBadgesRepository(mockClient);
  
  const newBadge = await repository.createUserBadge({
    user_id: 'user456',
    badge_id: '2',
    earned_at: new Date().toISOString()
  });
  
  assert.equal(newBadge.user_id, 'user456');
  assert.equal(newBadge.badge_id, '2');
});