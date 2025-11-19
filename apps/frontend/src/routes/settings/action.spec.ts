import type { ActionFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { updateBio } from '~/api';
import { PROFILE } from '~/constants';
import { userInfo } from '~/store';
import { action } from './action';

vi.mock('~/api', () => ({
  updateBio: vi.fn(),
}));

const mockGetState = {
  accessToken: 'mockAccessToken',
  refreshToken: 'refresh123',
  userId: 'user123',
};

vi.mock('~/store', () => ({
  userInfo: {
    getState: vi.fn(() => mockGetState),
  },
}));

describe('updateBio action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeRequest = (bio?: string, fullName?: string) => {
    const body = new URLSearchParams();
    if (bio) body.set('bio', bio);
    if (fullName) body.set('fullName', fullName);

    return new Request('http://localhost', {
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
  };

  it('returns an error when required fields or tokens are missing', async () => {
    (userInfo.getState as Mock).mockReturnValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh123',
      userId: null,
    });

    const req = makeRequest('My bio', 'John Doe');
    const result = await action({ request: req } as ActionFunctionArgs);

    expect(result).toEqual({ error: 'Missing credentials' });
  });

  it('returns proper error object when updateBio fails', async () => {
    (userInfo.getState as Mock).mockReturnValue(mockGetState);

    (updateBio as Mock).mockResolvedValue({
      error: { status: 400 },
    });

    const req = makeRequest('My bio', 'John Doe');
    const result = await action({ request: req } as ActionFunctionArgs);

    expect(result).toEqual({
      message:
        'The HTTP request PATCH v1/profile/update failed with status 400',
      success: false,
    });
  });

  it('redirects when updateBio succeeds', async () => {
    (userInfo.getState as Mock).mockReturnValue(mockGetState);

    (updateBio as Mock).mockResolvedValue({
      data: { updated: true },
      error: null,
    });

    const req = makeRequest('Updated bio', 'John Doe');
    const result = await action({ request: req } as ActionFunctionArgs);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe(PROFILE);
    }
  });

  it('returns unexpected error when API response is malformed', async () => {
    (userInfo.getState as Mock).mockReturnValue(mockGetState);

    (updateBio as Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    const req = makeRequest('Bio text', 'John Doe');
    const result = await action({ request: req } as ActionFunctionArgs);

    expect(result).toEqual({
      error: 'Unexpected response from profile update',
    });
  });
});
