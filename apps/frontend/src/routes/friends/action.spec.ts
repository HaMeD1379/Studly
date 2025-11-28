import type { ActionFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REQUEST_ACCEPTED_STATUS, REQUEST_REJECTED_STATUS } from '~/constants';
import { action } from './action';

// --- Define mocks using vi.hoisted() ---
const { mockSearchFriends, mockSendFriendRequest, mockUpdateFriendRequest } =
  vi.hoisted(() => ({
    mockSearchFriends: vi.fn(),
    mockSendFriendRequest: vi.fn(),
    mockUpdateFriendRequest: vi.fn(),
  }));

// --- Mock API module ---
vi.mock('~/api', () => ({
  searchFriends: mockSearchFriends,
  sendFriendRequest: mockSendFriendRequest,
  updateFriendRequest: mockUpdateFriendRequest,
}));

// --- Helper to create a fake Request object ---
const createMockRequest = (entries: Record<string, string>): Request => {
  const formData = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    formData.append(k, v);
  }
  return { formData: async () => formData } as unknown as Request;
};

describe('friends action()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when formtype is missing', async () => {
    const req = createMockRequest({});
    const result = await action({ request: req } as ActionFunctionArgs);
    expect(result).toEqual({ error: 'Missing form type' });
  });

  it('handles unknown formtype', async () => {
    const req = createMockRequest({ formtype: 'invalidType' });
    const result = await action({ request: req } as ActionFunctionArgs);
    expect(result).toEqual({ error: 'Unknown form type' });
  });

  it('handles searchFriend success', async () => {
    const mockData = [{ id: 1, name: 'Jane' }];
    mockSearchFriends.mockResolvedValue({
      data: { data: mockData },
      error: null,
    });

    const req = createMockRequest({
      formtype: 'searchFriend',
      searchUser: 'Jane',
    });

    const result = await action({ request: req } as ActionFunctionArgs);
    expect(mockSearchFriends).toHaveBeenCalledWith('Jane');
    expect(result).toEqual({
      data: mockData,
      formtype: 'searchFriends',
    });
  });

  it('handles sendFriendRequest success', async () => {
    mockSendFriendRequest.mockResolvedValue({ data: { success: true } });

    const req = createMockRequest({
      formtype: 'sendFriendRequest',
      requestUserId: '2',
      userId: '1',
    });

    const result = await action({ request: req } as ActionFunctionArgs);
    expect(mockSendFriendRequest).toHaveBeenCalledWith('1', '2');
    expect(result).toEqual({
      data: { success: true },
      formtype: 'sendFriendRequest',
      message: 'Friend request sent',
    });
  });

  it('handles acceptRequest success', async () => {
    mockUpdateFriendRequest.mockResolvedValue({ data: { ok: true } });

    const req = createMockRequest({
      formtype: 'acceptRequest',
      from_user: '1',
      to_user: '2',
    });

    const result = await action({ request: req } as ActionFunctionArgs);
    expect(mockUpdateFriendRequest).toHaveBeenCalledWith(
      '1',
      '2',
      REQUEST_ACCEPTED_STATUS,
    );
    expect(result).toEqual({
      data: { ok: true },
      formtype: 'sendFriendRequest',
      message: 'Friend request sent',
    });
  });

  it('handles rejectRequest success', async () => {
    mockUpdateFriendRequest.mockResolvedValue({ data: { ok: true } });

    const req = createMockRequest({
      formtype: 'rejectRequest',
      from_user: '1',
      to_user: '2',
    });

    const result = await action({ request: req } as ActionFunctionArgs);
    expect(mockUpdateFriendRequest).toHaveBeenCalledWith(
      '1',
      '2',
      REQUEST_REJECTED_STATUS,
    );
    expect(result).toEqual({
      data: { ok: true },
      formtype: 'sendFriendRequest',
      message: 'Friend request sent',
    });
  });
});
