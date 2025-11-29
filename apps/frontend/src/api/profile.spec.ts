import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import {
  PROFILE_CHANGES_BIO,
  PROFILE_FIND_USER,
  RETRIEVE_BIO,
} from '~/constants';
import { RequestMethods } from '~/types';
import { fetchBio, findUserById, updateBio } from './profile';

vi.mock('~/utilities/requests', () => ({
  request: vi.fn(),
}));

import { request } from '~/utilities/requests';

describe('profileApi functions', () => {
  const mockRequest = request as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockResolvedValue({ data: 'ok' });
  });

  it('calls request correctly with all fields in updateBio', async () => {
    await updateBio('token123', 'refresh456', 'user789', 'Jane', 'Bio text');

    expect(mockRequest).toHaveBeenCalledWith(
      RequestMethods.PATCH,
      PROFILE_CHANGES_BIO,
      {
        Authorization: 'Bearer token123',
      },
      JSON.stringify({
        bio: 'Bio text',
        full_name: 'Jane',
        refresh_token: 'refresh456',
        user_id: 'user789',
      }),
    );
  });

  it('handles empty name and bio correctly in updateBio', async () => {
    await updateBio('token123', 'refresh456', 'user789', '', '');

    expect(mockRequest).toHaveBeenCalledWith(
      RequestMethods.PATCH,
      PROFILE_CHANGES_BIO,
      {
        Authorization: 'Bearer token123',
      },
      JSON.stringify({
        bio: '',
        full_name: '',
        refresh_token: 'refresh456',
        user_id: 'user789',
      }),
    );
  });

  it('calls request with correct method and path in fetchBio', async () => {
    await fetchBio('user123');

    const expectedPath = `${RETRIEVE_BIO}/user123`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('calls request with correct method and path in findUserById', async () => {
    await findUserById('user123');

    const expectedPath = `${PROFILE_FIND_USER}/user123`;
    expect(mockRequest).toHaveBeenCalledWith(RequestMethods.GET, expectedPath);
  });

  it('returns the resolved result from request', async () => {
    mockRequest.mockResolvedValueOnce({ data: { success: true } });
    const result = await fetchBio('abc');
    expect(result).toEqual({ data: { success: true } });
  });
});
