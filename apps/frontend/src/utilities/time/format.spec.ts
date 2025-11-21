import { describe, expect, it } from 'vitest';
import { mockUnlockedBadgeTimestamp } from '~/mocks';
import { formatISOToYYYYMMDD, formatMinutesToHoursAndMinutes } from './format';

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

  it('format minutes time properly', () => {
    expect(formatMinutesToHoursAndMinutes(59)).toEqual('59m');
    expect(formatMinutesToHoursAndMinutes(60)).toEqual('1h 0m');
    expect(formatMinutesToHoursAndMinutes(61)).toEqual('1h 1m');
  })
});
