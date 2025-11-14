import { beforeEach, describe, expect, it } from 'vitest';
import { userInfoStore } from './userInfoStore';

describe('userInfoStore', () => {
  beforeEach(() => {
    userInfoStore.setState({ bio: '' });
    userInfoStore.setState({ name: '' });
    userInfoStore.setState({ email: '' });
    userInfoStore.setState({ userId: '' });
    userInfoStore.setState({ refreshToken: '' });
  });

  it('updates bio when setBio is called', () => {
    const { setBio } = userInfoStore.getState();
    setBio('New Bio');

    const { bio } = userInfoStore.getState();
    expect(bio).toBe('New Bio');
  });
  it('updates name when setName is called', () => {
    const { setName } = userInfoStore.getState();
    setName('Test User');

    const { name } = userInfoStore.getState();
    expect(name).toBe('Test User');
  });
  it('updates email when setEmail is called', () => {
    const { setEmail } = userInfoStore.getState();
    setEmail('testuser@studly.com');

    const { email } = userInfoStore.getState();
    expect(email).toBe('testuser@studly.com');
  });
  it('updates userId when setId is called', () => {
    const { setId } = userInfoStore.getState();
    setId('1');

    const { userId } = userInfoStore.getState();
    expect(userId).toBe('1');
  });
  it('updates refreshToken when setRefreshToken is called', () => {
    const { setRefreshToken } = userInfoStore.getState();
    setRefreshToken('token');

    const { refreshToken } = userInfoStore.getState();
    expect(refreshToken).toBe('token');
  });
});
