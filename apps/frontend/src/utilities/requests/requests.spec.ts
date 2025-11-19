import { afterAll, expect, vi } from 'vitest';
import { LOGIN } from '~/constants';
import {
  mockFailureMessage,
  mockFailureRequest,
  mockFailureStatus,
  mockSuccessData,
  mockSuccessRequest,
} from '~/mocks';
import { RequestMethods } from '~/types';
import { request } from './requests';

describe('requests', () => {
  it('returns with data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => mockSuccessRequest),
    );

    const fetchRequest = await request(RequestMethods.GET, LOGIN);

    expect(fetchRequest.data).not.toBeUndefined();
    expect(fetchRequest.error).toBeUndefined();
    expect(await fetchRequest.data).toEqual(mockSuccessData);
  });

  it('returns with error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => mockFailureRequest),
    );

    const fetchRequest = await request(RequestMethods.GET, LOGIN);

    expect(fetchRequest.data).toBeUndefined();
    expect(fetchRequest.error).not.toBeUndefined();
    expect(fetchRequest.error).toEqual({
      message: mockFailureMessage,
      status: mockFailureStatus,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });
});
