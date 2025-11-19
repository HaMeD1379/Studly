import type { ActionFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { updateBio } from '~/api';
import { userInfoStore } from '~/store';
import { action } from './action';
import { PROFILE } from '~/constants';

vi.mock('~/api', () => ({
  updateBio: vi.fn(),
}));

const mockGetState = {
  refreshToken: 'refresh123',
  userId: 'user123',
};

vi.mock('~/store', () => ({
  userInfoStore: {
    getState: vi.fn(() => mockGetState),
  },
}));

describe('updateBio action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      clear: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    });
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
    (userInfoStore.getState as Mock).mockReturnValueOnce({
      refreshToken: 'refresh123',
      userId: null,
    });
    (localStorage.getItem as Mock).mockReturnValue('token');

    const req = makeRequest('My bio', 'John Doe');
    const result = await action({ request: req } as ActionFunctionArgs);

    expect(result).toEqual({ error: 'Missing credentials' });
  });

  it('returns proper error object when updateBio fails', async () => {
    (userInfoStore.getState as Mock).mockReturnValue(mockGetState);
    (localStorage.getItem as Mock).mockReturnValue('mockAccessToken');

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
    (userInfoStore.getState as Mock).mockReturnValue(mockGetState);
    (localStorage.getItem as Mock).mockReturnValue('mockAccessToken');

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
    (userInfoStore.getState as Mock).mockReturnValue(mockGetState);
    (localStorage.getItem as Mock).mockReturnValue('mockAccessToken');

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
