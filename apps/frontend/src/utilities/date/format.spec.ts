import { describe, expect, it } from 'vitest';
import { mockUnlockedBadgeTimestamp } from '~/mocks';
import { formatToYYYYMMDD } from './format';

describe('format', () => {
  it('formats timestamp date properly', () => {
    expect(formatToYYYYMMDD(mockUnlockedBadgeTimestamp)).toMatch(
      /^\d{4}-\d{1,2}-\d{1,2}$/,
    );
  });

  it('handles -1 and 0 timestamp', () => {
    expect(formatToYYYYMMDD(-1)).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
    expect(formatToYYYYMMDD(0)).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
  });
});
