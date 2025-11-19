//local storage mock was generated using GEN AI (Chat GPT)
const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => ({ redirect: path })),
}));

vi.mock('react-router', () => ({
  redirect: redirectMock,
}));

import { describe, expect, it, type Mock, vi } from 'vitest';
import { logout } from '~/api';
import { LOGIN } from '~/constants';
import { action } from './action';

vi.mock('~/api', () => ({
  logout: vi.fn(),
}));

let accessToken = '';
const mockSetAccessToken = (value: string) => {
  accessToken = value;
};
const mockSetAccessStored = vi.fn();
const mockSetCheckAccess = vi.fn();

vi.mock('~/store', () => ({
  userInfo: {
    getState: () => ({
      accessToken,
      setAccessStored: mockSetAccessStored,
      setAccessToken: mockSetAccessToken,
      setCheckAccess: mockSetCheckAccess,
    }),
  },
}));

describe('logout action', () => {
  it('returns error when no token exists', async () => {
    const result = await action();

    expect(result).toEqual({ error: 'Logout api call failed' });
    expect(logout).not.toHaveBeenCalled();
    expect(mockSetAccessStored).not.toHaveBeenCalled();
    expect(mockSetCheckAccess).not.toHaveBeenCalled();
  });

  it('returns API error when logout returns an error', async () => {
    mockSetAccessToken('validToken');

    (logout as Mock).mockResolvedValueOnce({
      data: null,
      error: 'failed',
    });

    const result = await action();

    expect(result).toBe('failed');
    expect(logout).toHaveBeenCalledWith('validToken');
    expect(mockSetAccessStored).not.toHaveBeenCalled();
    expect(mockSetCheckAccess).not.toHaveBeenCalled();
  });

  it('clears access, updates store, and redirects on successful logout', async () => {
    mockSetAccessToken('validToken');

    (logout as Mock).mockResolvedValueOnce({
      data: { ok: true },
      error: null,
    });

    const result = await action();

    expect(accessToken).toEqual('');
    expect(mockSetAccessStored).toHaveBeenCalledWith(false);
    expect(mockSetCheckAccess).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith(LOGIN);
    expect(result).toEqual({ redirect: LOGIN });
  });
});
