import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signUp } from '~/api';
import { STUDY } from '~/constants';
import { action } from './action';

vi.mock('~/api', () => ({
  signUp: vi.fn(),
}));

const mockSetEmail = vi.fn();
const mockSetName = vi.fn();
const mockSetId = vi.fn();
const mockSetRefreshToken = vi.fn();

vi.mock('~/store/userInfo', () => ({
  userInfo: {
    getState: vi.fn(() => ({
      setEmail: mockSetEmail,
      setId: mockSetId,
      setName: mockSetName,
      setRefreshToken: mockSetRefreshToken,
    })),
  },
}));

beforeEach(() => {
  mockSetEmail.mockReset();
  mockSetName.mockReset();
  mockSetId.mockReset();
  mockSetRefreshToken.mockReset();
});

describe('signup action', () => {
  it('returns an error when API responds with error', async () => {
    (signUp as unknown as Mock).mockResolvedValueOnce({
      error: { message: 'Email already used' },
    });

    const body = new URLSearchParams();
    body.set('name', 'John Doe');
    body.set('email', 'john@example.com');
    body.set('password', '123456');

    const request = new Request('http://localhost', {
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const result = await action({
      context: {},
      params: {},
      request,
    });

    expect(result).toEqual({ message: 'Email already used' });
  });

  it('redirects when signup succeeds', async () => {
    (signUp as unknown as Mock).mockResolvedValueOnce({
      data: {
        data: {
          session: {
            access_token: 'ACCESS123',
            refresh_token: 'REFRESH123',
          },
          user: {
            email: 'john@example.com',
            full_name: 'John Doe',
            id: 'USER123',
          },
        },
      },
      error: null,
    });

    const body = new URLSearchParams();
    body.set('name', 'John Doe');
    body.set('email', 'john@example.com');
    body.set('password', 'password123');

    const request = new Request('http://localhost', {
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const result = await action({
      context: {},
      params: {},
      request,
    });

    if (!(result instanceof Response)) {
      throw new Error(
        `Expected a redirect Response, got: ${JSON.stringify(result)}`,
      );
    }

    expect(result.status).toBe(302);
    expect(result.headers.get('Location')).toBe(STUDY);

    expect(mockSetEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockSetName).toHaveBeenCalledWith('John Doe');
    expect(mockSetId).toHaveBeenCalledWith('USER123');
    expect(mockSetRefreshToken).toHaveBeenCalledWith('REFRESH123');
  });

  it('returns undefined when fields are missing', async () => {
    const body = new URLSearchParams(); // no fields

    const request = new Request('http://localhost', {
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const result = await action({
      context: {},
      params: {},
      request,
    });

    expect(result).toBeUndefined();
  });
});
