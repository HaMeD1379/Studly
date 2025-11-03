const { startSessionMock, stopSessionMock, setSessionIdMock } = vi.hoisted(() => ({
  startSessionMock: vi.fn(),
  stopSessionMock: vi.fn(),
  setSessionIdMock: vi.fn(),
}))

vi.mock('~/api/sessions', () => ({
  startSession: startSessionMock,
  stopSession: stopSessionMock,
}));

vi.mock('~/utilities/session/session', () => ({
  setSessionId: setSessionIdMock,
}));

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { action } from './action';
import { mockSessionId } from '~/mocks';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('start type succeeds', async () => {
    startSessionMock.mockReturnValueOnce({
      data: Promise.resolve({
        session: {
          id: mockSessionId
        }
      })
    })

    const formData = new FormData();
    formData.set('type', 'start');

    const request = new Request('https:localhost/', {
      method: 'POST',
      body: formData,
    });

    await action({request, params: {}, context: {}});
    expect(startSessionMock).toHaveBeenCalled();
    expect(setSessionIdMock).toHaveBeenCalledWith(mockSessionId);
  });

  it('stop type succeeds', async () => {
    stopSessionMock.mockReturnValueOnce({})

    const formData = new FormData();
    formData.set('type', 'stop');

    const request = new Request('https:localhost/', {
      method: 'POST',
      body: formData,
    });

    await action({request, params: {}, context: {}});
    expect(stopSessionMock).toHaveBeenCalled();
  });

  it('no type succeeds', async () => {
    startSessionMock.mockReturnValueOnce({});
    stopSessionMock.mockReturnValueOnce({});

    const formData = new FormData();
    formData.set('type', 'none');

    const request = new Request('https:localhost/', {
      method: 'POST',
      body: formData,
    });

    const result = await action({request, params: {}, context: {}});
    expect(stopSessionMock).not.toHaveBeenCalled();
    expect(startSessionMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: false });
  });
});