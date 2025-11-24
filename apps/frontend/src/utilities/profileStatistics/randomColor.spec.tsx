import { describe, expect, it } from 'vitest';
import { badgeColors } from '~/constants';
import { randomColour } from './randomColor';

describe('randomColour', () => {
  it('returns a colour that exists within badgeColors', () => {
    const result = randomColour();
    expect(badgeColors).toContain(result);
  });

  it('never returns a value outside of badgeColors', () => {
    const iterations = 200;
    for (let i = 0; i < iterations; i++) {
      const color = randomColour();
      expect(badgeColors.includes(color)).toBe(true);
    }
  });

  it('produces different values over many calls (randomness)', () => {
    const results = new Set<string>();

    for (let i = 0; i < 200; i++) {
      results.add(randomColour());
    }

    // Should produce at least a few unique values
    expect(results.size).toBeGreaterThan(1);
  });

  it('returns the only available value when badgeColors has length 1', () => {
    const single = ['purple'];
    const original = [...badgeColors];

    // @ts-expect-error overwrite for test
    badgeColors.length = 0;
    badgeColors.push(...single);

    for (let i = 0; i < 50; i++) {
      expect(randomColour()).toBe('purple');
    }

    // Restore array after test
    badgeColors.length = 0;
    badgeColors.push(...original);
  });
});
