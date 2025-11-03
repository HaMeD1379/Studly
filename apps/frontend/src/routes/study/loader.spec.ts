const { mockFetchTodaysSessionSummary, mockFetchSessionsList } = vi.hoisted(() => ({
  mockFetchTodaysSessionSummary: vi.fn(),
  mockFetchSessionsList: vi.fn(),
}));

vi.mock('~/api/sessions', () => ({
  fetchSessionsList: mockFetchSessionsList,
  fetchTodaysSessionSummary: mockFetchTodaysSessionSummary,
}));

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loader } from './loader';
import { mockErrorData, mockSessionData } from '~/mocks';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns data with sessions and summary', async () => {
    mockFetchSessionsList.mockResolvedValueOnce({
      data: Promise.resolve({ sessions: mockSessionData.data.sessionsList }),
    });
    mockFetchTodaysSessionSummary.mockResolvedValueOnce({
      data: Promise.resolve(mockSessionData.data.summary),
    });

    const result = await loader();

    expect(result).toEqual(mockSessionData);
  });

  it('returns error', async () => {
    mockFetchSessionsList.mockResolvedValueOnce({
      data: Promise.resolve(),
      error: true,
    })
    mockFetchTodaysSessionSummary.mockResolvedValueOnce({});

    const result = await loader();
    expect(result).toEqual(mockErrorData);
  });
});