import { beforeEach, describe, expect, it } from 'vitest';
import { userInfo } from './userInfo';

describe('userInfo', () => {
  beforeEach(() => {
    userInfo.setState({ bio: '' });
    userInfo.setState({ name: '' });
    userInfo.setState({ email: '' });
    userInfo.setState({ userId: '' });
    userInfo.setState({ refreshToken: '' });
  });

  it('updates bio when setBio is called', () => {
    const { setBio } = userInfo.getState();
    setBio('New Bio');

    const { bio } = userInfo.getState();
    expect(bio).toBe('New Bio');
  });
  it('updates name when setName is called', () => {
    const { setName } = userInfo.getState();
    setName('Test User');

    const { name } = userInfo.getState();
    expect(name).toBe('Test User');
  });
  it('updates email when setEmail is called', () => {
    const { setEmail } = userInfo.getState();
    setEmail('testuser@studly.com');

    const { email } = userInfo.getState();
    expect(email).toBe('testuser@studly.com');
  });
  it('updates userId when setId is called', () => {
    const { setId } = userInfo.getState();
    setId('1');

    const { userId } = userInfo.getState();
    expect(userId).toBe('1');
  });
  it('updates refreshToken when setRefreshToken is called', () => {
    const { setRefreshToken } = userInfo.getState();
    setRefreshToken('token');

    const { refreshToken } = userInfo.getState();
    expect(refreshToken).toBe('token');
  });
  it('updates accessToken when setAccessToken is called', () => {
    const { setAccessToken } = userInfo.getState();
    setAccessToken('token');

    const { accessToken } = userInfo.getState();
    expect(accessToken).toBe('token');
  });
});
