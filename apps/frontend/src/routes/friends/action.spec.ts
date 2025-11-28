import { describe, it, expect, vi } from 'vitest';
import { action } from './action';
import * as api from '~/api';
import type { SearchFriendsWrapper, FriendsActionResponse } from '~/types';

const createMockRequest = (entries: Record<string, string>): Request => {
  const formData = new FormData();
  Object.entries(entries).forEach(([k, v]) => formData.append(k, v));
  return { formData: async () => formData } as unknown as Request;
};

describe('friends action', () => {
    /*
  it('handles searchFriend', async () => {
    // Mocked API response matching SearchFriendsWrapper
    const mockSearchResult: SearchFriendsWrapper = {
      message: 'Success',
      data: {
        data: {
          result: [
            { user_id: '1', email: 'alice@test.com', full_name: 'Alice', bio: 'Bio' },
          ],
          count: 1,
        },
      },
    };

    vi.spyOn(api, 'searchFriends').mockResolvedValue({ data: mockSearchResult });

    const args = {
      request: createMockRequest({ formtype: 'searchFriend', searchUser: 'alice' }),
      params: {},
      context: {},
    };

    const result: FriendsActionResponse = await action(args);

    // Narrow type before accessing result
    if ('formtype' in result && result.formtype === 'searchFriends') {
  const searchResults = result.data?.data.result; // data -> { data: SearchFriends } -> result[]
  expect(searchResults?.[0].user_id).toBe('1');
  expect(searchResults?.[0].email).toBe('alice@test.com');
}
  });*/

  it('handles sendFriendRequest', async () => {
    const mockSend = {
      id: 'req-1',
      from_user: '123',
      to_user: '456',
      status: 1,
      updated_at: '2025-11-26T00:00:00Z',
    };

    vi.spyOn(api, 'sendFriendRequest').mockResolvedValue({ data: mockSend });

    const args = {
      request: createMockRequest({
        formtype: 'sendFriendRequest',
        userId: '123',
        requestUserId: '456',
      }),
      params: {},
      context: {},
    };

    const result: FriendsActionResponse = await action(args);

    if ('formtype' in result && result.formtype === 'sendFriendRequest') {
      expect(result.data?.id).toBe('req-1');
    }
  });
});