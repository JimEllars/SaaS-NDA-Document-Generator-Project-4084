import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { formatEffectiveDate } from './dateUtils';

describe('formatEffectiveDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format a valid date string correctly', () => {
    const input = '2023-10-27';
    const expected = 'October 27, 2023';
    expect(formatEffectiveDate(input)).toBe(expected);
  });

  it('should handle single digit days and months correctly', () => {
    const input = '2023-01-05';
    const expected = 'January 5, 2023';
    expect(formatEffectiveDate(input)).toBe(expected);
  });

  it('should handle leap years correctly', () => {
    const input = '2024-02-29';
    const expected = 'February 29, 2024';
    expect(formatEffectiveDate(input)).toBe(expected);
  });

  it('should return the current date formatted when input is empty string', () => {
    const date = new Date(2023, 9, 15); // October 15, 2023
    vi.setSystemTime(date);

    const expected = 'October 15, 2023';
    expect(formatEffectiveDate('')).toBe(expected);
  });

  it('should return the current date formatted when input is null', () => {
    const date = new Date(2023, 11, 25); // December 25, 2023
    vi.setSystemTime(date);

    const expected = 'December 25, 2023';
    expect(formatEffectiveDate(null)).toBe(expected);
  });

  it('should return the current date formatted when input is undefined', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024
    vi.setSystemTime(date);

    const expected = 'January 1, 2024';
    expect(formatEffectiveDate(undefined)).toBe(expected);
  });

  it('should return the current date formatted when input is invalid string', () => {
    const date = new Date(2023, 5, 15); // June 15, 2023
    vi.setSystemTime(date);

    const expected = 'June 15, 2023';
    expect(formatEffectiveDate('invalid-date')).toBe(expected);
  });

  it('should return the current date formatted when input is partial date string', () => {
    const date = new Date(2023, 5, 15); // June 15, 2023
    vi.setSystemTime(date);

    const expected = 'June 15, 2023';
    expect(formatEffectiveDate('2023-')).toBe(expected);
  });

  it('should handle date rollover for invalid day (e.g., Feb 30)', () => {
      // JavaScript Date object rolls over extra days to the next month
      // "2023-02-30" -> March 2, 2023
      const input = '2023-02-30';
      const expected = 'March 2, 2023';
      expect(formatEffectiveDate(input)).toBe(expected);
  });

  it('should treat non-standard separators as valid if positions are correct', () => {
      // The implementation uses substring(0,4), substring(5,7), substring(8,10)
      const input = '2023/10/27';
      const expected = 'October 27, 2023';
      expect(formatEffectiveDate(input)).toBe(expected);
  });
});
