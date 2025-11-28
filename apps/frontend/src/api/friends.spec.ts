import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import {
  ALL_FRIENDS,
  FRIENDS_COUNT,
  PROFILE_INFO,
  RECEIVED_FRIEND_REQUEST,
  REQUEST_ACCEPTED_STATUS,
  REQUEST_PENDING_STATUS,
  SEND_FRIEND_REQUEST,
  UPDATE_FRIEND_REQUEST,
} from '~/constants';
import { RequestMethods } from '~/types';
import {
  getAllFriends,
  getFriendRequestCount,
  getFriendsCount,
  receivedFriendRequest,
  searchFriends,
  sendFriendRequest,
  updateFriendRequest,
  viewFriendRequests,
} from './friends';

vi.mock('~/utilities/requests', () => ({
  request: vi.fn(),
}));

vi.mock('~/store', () => ({
  userInfo: {
    getState: vi.fn(() => ({ userId: '123' })),
  },
}));

import { userInfo } from '~/store';
import { request } from '~/utilities/requests';

describe('friendsApi utility functions', () => {
  const mockRequest = request as unknown as Mock;
  const mockUserInfo = userInfo.getState as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserInfo.mockReturnValue({ userId: '123' });
    mockRequest.mockResolvedValue({ data: 'ok' });
  });

  it('calls request with correct path in getFriendsCount', async () => {
    await getFriendsCount();

    const expectedPath = `${FRIENDS_COUNT}/123?status=${REQUEST_ACCEPTED_STATUS}`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('calls request with correct path in getFriendRequestCount', async () => {
    await getFriendRequestCount();

    const expectedPath = `${FRIENDS_COUNT}/123?status=${REQUEST_PENDING_STATUS}`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('calls request with correct path in getAllFriends', async () => {
    await getAllFriends();

    const expectedPath = `${ALL_FRIENDS}/123?status=${REQUEST_ACCEPTED_STATUS}`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('throws error in getAllFriends when userId missing', async () => {
    mockUserInfo.mockReturnValue({ userId: '' });
    await expect(getAllFriends()).rejects.toThrow('User ID is missing');
  });

  it('calls request with correct path in viewFriendRequests', async () => {
    await viewFriendRequests();

    const expectedPath = `${ALL_FRIENDS}/123?status=${REQUEST_PENDING_STATUS}`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('throws error in viewFriendRequests when userId missing', async () => {
    mockUserInfo.mockReturnValue({ userId: '' });
    await expect(viewFriendRequests()).rejects.toThrow('User ID is missing');
  });

  it('calls request with correct path in searchFriends', async () => {
    await searchFriends('alex');
    const expectedPath = `${PROFILE_INFO}?str=alex`;

    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('calls request correctly in sendFriendRequest', async () => {
    await sendFriendRequest('123', '456');

    const expectedBody = JSON.stringify({ from_user: '123', to_user: '456' });

    expect(mockRequest).toHaveBeenCalledWith(
      RequestMethods.POST,
      SEND_FRIEND_REQUEST,
      undefined,
      expectedBody,
    );
  });

  it('calls request correctly in receivedFriendRequest', async () => {
    await receivedFriendRequest('789');

    const expectedPath = `${RECEIVED_FRIEND_REQUEST}/789`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('calls request correctly in updateFriendRequest', async () => {
    await updateFriendRequest('1', '2', 3);

    const expectedBody = JSON.stringify({
      from_user: '1',
      status: 3,
      to_user: '2',
    });

    expect(mockRequest).toHaveBeenCalledWith(
      RequestMethods.PATCH,
      UPDATE_FRIEND_REQUEST,
      undefined,
      expectedBody,
    );
  });
});
