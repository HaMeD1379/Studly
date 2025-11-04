const { startSessionMock, stopSessionMock, setSessionIdMock } = vi.hoisted(
  () => ({
    setSessionIdMock: vi.fn(),
    startSessionMock: vi.fn(),
    stopSessionMock: vi.fn(),
  }),
);

vi.mock('~/api/sessions', () => ({
  startSession: startSessionMock,
  stopSession: stopSessionMock,
}));

vi.mock('~/utilities/session/session', () => ({
  setSessionId: setSessionIdMock,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSessionId } from '~/mocks';
import { action } from './action';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('start type succeeds', async () => {
    startSessionMock.mockReturnValueOnce({
      data: {
        session: {
          id: mockSessionId,
        },
      },
    });

    const formData = new URLSearchParams();
    formData.set('type', 'start');

    const request = new Request('https:localhost/', {
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    await action({ context: {}, params: {}, request });
    expect(startSessionMock).toHaveBeenCalled();
    expect(setSessionIdMock).toHaveBeenCalledWith(mockSessionId);
  });

  it('stop type succeeds', async () => {
    stopSessionMock.mockReturnValueOnce({});

    const formData = new URLSearchParams();
    formData.set('type', 'stop');

    const request = new Request('https:localhost/', {
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    await action({ context: {}, params: {}, request });
    expect(stopSessionMock).toHaveBeenCalled();
  });

  it('no type succeeds', async () => {
    startSessionMock.mockReturnValueOnce({});
    stopSessionMock.mockReturnValueOnce({});

    const formData = new FormData();
    formData.set('type', 'none');

    const request = new Request('https:localhost/', {
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const result = await action({ context: {}, params: {}, request });
    expect(stopSessionMock).not.toHaveBeenCalled();
    expect(startSessionMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: false });
  });
});
