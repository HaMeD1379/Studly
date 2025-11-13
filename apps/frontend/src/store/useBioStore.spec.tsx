import { beforeEach, describe, expect, it } from 'vitest';
import { useBioStore } from './useBioStore';

describe('useBioStore', () => {
  beforeEach(() => {
    useBioStore.setState({ bio: '' });
  });

  it('updates bio when setBio is called', () => {
    const { setBio } = useBioStore.getState();
    setBio('New Bio');

    const { bio } = useBioStore.getState();
    expect(bio).toBe('New Bio');
  });
});
