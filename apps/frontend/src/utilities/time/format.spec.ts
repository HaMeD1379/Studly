import { describe, expect, it } from 'vitest';
import { mockUnlockedBadgeTimestamp } from '~/mocks';
import { formatISOToYYYYMMDD, formatMinutesToHoursAndMinutes, getSunday, hoursAndMinutes } from './format';


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
  //hours and minutes test
  it('hours and minute works fior less than an hour time length', () => {
    const result = hoursAndMinutes(50);
    expect(result).toBe('50m');
  });
  it('hours and minute works for time length = 60', () => {
    const result = hoursAndMinutes(50);
    expect(result).toBe('50m');
  });
  it('hours and minute works for time length = 60', () => {
    expect(() => hoursAndMinutes(-1)).toThrow('Invalid time length');
  });
  it('hours and minute works for time length greater than an hour', () => {
    expect(hoursAndMinutes(90)).toBe('1 hour 30 minutes');
  });

  //getSunday test suite
  function sameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  it('returns the same date when the given date is already Sunday', () => {
    const date = new Date(2024, 4, 5); // May 5, 2024 (Sunday)
    const result = getSunday(date);
    expect(sameDay(result, new Date(2024, 4, 5))).toBe(true);
  });

  it('returns the previous Sunday for a midweek date (e.g., Wednesday)', () => {
    const date = new Date(2024, 4, 8); // May 8, 2024 (Wednesday)
    const result = getSunday(date);
    expect(sameDay(result, new Date(2024, 4, 5))).toBe(true);
  });

  it('returns correct Sunday when date is Monday', () => {
    const date = new Date(2024, 4, 6); // May 6, 2024 (Monday)
    const result = getSunday(date);
    expect(sameDay(result, new Date(2024, 4, 5))).toBe(true);
  });

  it('works across month boundaries', () => {
    const date = new Date(2024, 5, 1); // June 1, 2024 (Saturday)
    const result = getSunday(date);
    expect(sameDay(result, new Date(2024, 4, 26))).toBe(true); // May 26, 2024
  });

  it('works across year boundaries', () => {
    const date = new Date(2024, 0, 3); // Jan 3, 2024 (Wednesday)
    const result = getSunday(date);
    expect(sameDay(result, new Date(2023, 11, 31))).toBe(true); // Dec 31, 2023
  });

  it('does not mutate the original date object', () => {
    const date = new Date(2024, 4, 8);
    const dateCopy = new Date(date);
    getSunday(date);
    expect(date.getTime()).toBe(dateCopy.getTime());
    });

  it('format minutes time properly', () => {
    expect(formatMinutesToHoursAndMinutes(59)).toEqual('59m');
    expect(formatMinutesToHoursAndMinutes(60)).toEqual('1h 0m');
    expect(formatMinutesToHoursAndMinutes(61)).toEqual('1h 1m');
  });
})
