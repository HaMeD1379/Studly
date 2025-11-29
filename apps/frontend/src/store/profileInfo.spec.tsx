import { beforeEach, describe, expect, it } from 'vitest';
import { profileInfo } from '~/store/profileInfo';

describe('profileInfo store', () => {
  beforeEach(() => {
    profileInfo.setState({ allTimeHoursStudied: '' });
  });

  it('should have the initial state', () => {
    const state = profileInfo.getState();
    expect(state.allTimeHoursStudied).toBe('');
  });

  it('should update allTimeHoursStudied using setAllTimeHoursStudied', () => {
    const newHours = '120m';
    profileInfo.getState().setAllTimeHoursStudied(newHours);

    const state = profileInfo.getState();
    expect(state.allTimeHoursStudied).toBe(newHours);
  });
});
