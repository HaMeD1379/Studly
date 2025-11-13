import { describe, expect, it } from 'vitest';
import { mockUnlockedBadgeTimestamp } from '~/mocks';
import { formatISOToYYYYMMDD } from './format';

describe('format', () => {
  it('formats timestamp date properly', () => {
    expect(formatISOToYYYYMMDD(mockUnlockedBadgeTimestamp)).toEqual(
      '2024-04-04',
    );
  });

  it('invalid timestamp returns itself', () => {
    expect(formatISOToYYYYMMDD('')).toEqual('');
    expect(formatISOToYYYYMMDD('test')).toEqual('test');
    expect(formatISOToYYYYMMDD('2024-04-04-04-04-04')).toEqual(
      '2024-04-04-04-04-04',
    );
  });
});
