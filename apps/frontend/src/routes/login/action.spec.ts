import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { login } from '~/api';
import { AVATAR_ONLINE, HOME } from '~/constants';
import { action } from './action';

vi.mock('~/api', () => ({
  login: vi.fn(),
}));

const mockSetAccessToken = vi.fn();
const mockSetEmail = vi.fn();
const mockSetName = vi.fn();
const mockSetId = vi.fn();
const mockSetRefreshToken = vi.fn();
const mockSetAvatarState = vi.fn();

vi.mock('~/store/userInfo', () => ({
  userInfo: {
    getState: () => ({
      setAccessToken: mockSetAccessToken,
      setAvatarState: mockSetAvatarState,
      setEmail: mockSetEmail,
      setId: mockSetId,
      setName: mockSetName,
      setRefreshToken: mockSetRefreshToken,
    }),
  },
}));

describe('login action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeRequest = (email?: string, password?: string) => {
    const body = new URLSearchParams();
    if (email) body.set('email', email);
    if (password) body.set('password', password);

    return new Request('http://localhost/', {
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
  };

  it('returns an error when email or password is missing', async () => {
    const req = makeRequest('test@example.com'); // missing password
    const result = await action({ context: {}, params: {}, request: req });

    expect(result).toEqual({ error: 'Missing credentials' });
  });

  it('returns proper error object when login API fails', async () => {
    (login as Mock).mockResolvedValue({
      error: { status: 401 },
    });

    const req = makeRequest('test@example.com', 'password123');
    const result = await action({ context: {}, params: {}, request: req });

    expect(result).toEqual({
      message: 'The HTTP request POST auth/login failed with status 401',
      success: false,
    });
  });

  it('stores tokens, updates store, and redirects on success', async () => {
    const mockResponse = {
      data: {
        data: {
          session: {
            access_token: 'access123',
            refresh_token: 'refresh123',
          },
          user: {
            email: 'john@example.com',
            full_name: 'John Doe',
            id: 'user123',
          },
        },
      },
      error: null,
    };

    (login as Mock).mockResolvedValue(mockResponse);

    const req = makeRequest('john@example.com', 'password123');

    const result = await action({ context: {}, params: {}, request: req });

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe(HOME);
    }

    expect(mockSetAccessToken).toHaveBeenCalledWith('access123');
    expect(mockSetEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockSetName).toHaveBeenCalledWith('John Doe');
    expect(mockSetId).toHaveBeenCalledWith('user123');
    expect(mockSetRefreshToken).toHaveBeenCalledWith('refresh123');
    expect(mockSetAvatarState).toHaveBeenCalledWith(AVATAR_ONLINE);
  });

  it('returns Unexpected error when API response is malformed', async () => {
    (login as Mock).mockResolvedValue({
      data: null,
      error: null,
    });

    const req = makeRequest('x@y.com', 'pass123');
    const result = await action({ context: {}, params: {}, request: req });

    expect(result).toEqual({ error: 'Unexpected response from login' });
  });
});
