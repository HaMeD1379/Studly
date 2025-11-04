const { mockFetchTodaysSessionSummary, mockFetchSessionsList } = vi.hoisted(
  () => ({
    mockFetchSessionsList: vi.fn(),
    mockFetchTodaysSessionSummary: vi.fn(),
  }),
);

vi.mock('~/api/sessions', () => ({
  fetchSessionsList: mockFetchSessionsList,
  fetchTodaysSessionSummary: mockFetchTodaysSessionSummary,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockErrorData, mockSessionData } from '~/mocks';
import { loader } from './loader';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns data with sessions and summary', async () => {
    mockFetchSessionsList.mockResolvedValueOnce({
      data: { sessions: mockSessionData.data.sessionsList },
    });
    mockFetchTodaysSessionSummary.mockResolvedValueOnce({
      data: mockSessionData.data.summary,
    });

    const result = await loader();

    expect(result).toEqual(mockSessionData);
  });

  it('returns error', async () => {
    mockFetchSessionsList.mockResolvedValueOnce({
      data: Promise.resolve(),
      error: true,
    });
    mockFetchTodaysSessionSummary.mockResolvedValueOnce({});

    const result = await loader();
    expect(result).toEqual(mockErrorData);
  });
});
