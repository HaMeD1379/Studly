//local storage mock was generated using GEN AI (Chat GPT)
const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => ({ redirect: path })),
}));

vi.mock('react-router', () => ({
  redirect: redirectMock,
}));

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { logout } from '~/api';
import { action } from './action';
import { LOGIN } from '~/constants';

vi.mock('~/api', () => ({
  logout: vi.fn(),
}));

const mockSetAccessStored = vi.fn();
const mockSetCheckAccess = vi.fn();

vi.mock('~/store', () => ({
  userInfo: {
    getState: () => ({
      setAccessStored: mockSetAccessStored,
      setCheckAccess: mockSetCheckAccess,
    }),
  },
}));

type MockStorage = {
  getItem: Mock;
  setItem: Mock;
  removeItem: Mock;
  clear: Mock;
};

const createMockStorage = (): MockStorage => {
  let store: Record<string, string> = {};

  return {
    clear: vi.fn(() => {
      store = {};
    }),
    getItem: vi.fn((key) => store[key] ?? null),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    setItem: vi.fn((key, val) => {
      store[key] = val;
    }),
  };
};

describe('logout action', () => {
  let mockStorage: MockStorage;
  beforeEach(() => {
    mockStorage = createMockStorage();

    vi.stubGlobal('localStorage', mockStorage);
  });

  it('returns error when no token exists', async () => {
    mockStorage.getItem.mockReturnValueOnce(null);

    const result = await action();

    expect(result).toEqual({ error: 'Logout api call failed' });
    expect(logout).not.toHaveBeenCalled();
    expect(mockSetAccessStored).not.toHaveBeenCalled();
    expect(mockSetCheckAccess).not.toHaveBeenCalled();
  });

  it('returns API error when logout returns an error', async () => {
    mockStorage.getItem.mockReturnValueOnce('validToken');

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
    mockStorage.getItem.mockReturnValueOnce('validToken');

    (logout as Mock).mockResolvedValueOnce({
      data: { ok: true },
      error: null,
    });

    const result = await action();

    expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockSetAccessStored).toHaveBeenCalledWith(false);
    expect(mockSetCheckAccess).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith(LOGIN);
    expect(result).toEqual({ redirect: LOGIN });
  });
});
