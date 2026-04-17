import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatEffectiveDate } from './dateUtils';

describe('formatEffectiveDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format a valid date string correctly', () => {
    expect(formatEffectiveDate('2023-10-27')).toBe('October 27, 2023');
  });

  it('should handle single digit days and months correctly', () => {
    expect(formatEffectiveDate('2023-01-05')).toBe('January 5, 2023');
  });

  it('should handle leap years correctly', () => {
    expect(formatEffectiveDate('2024-02-29')).toBe('February 29, 2024');
  });

  it('should return Invalid Date when input is empty string', () => {
    expect(formatEffectiveDate('')).toBe('Invalid Date');
  });

  it('should return Invalid Date when input is null', () => {
    expect(formatEffectiveDate(null)).toBe('Invalid Date');
  });

  it('should return Invalid Date when input is undefined', () => {
    expect(formatEffectiveDate(undefined)).toBe('Invalid Date');
  });

  it('should return Invalid Date when input is invalid string', () => {
    expect(formatEffectiveDate('invalid-date')).toBe('Invalid Date');
  });

  it('should return Invalid Date when input is partial date string', () => {
    expect(formatEffectiveDate('2023-')).toBe('Invalid Date');
  });

  it('should handle date rollover for invalid day (e.g., Feb 30)', () => {
    // JavaScript's Date object rolls over extra days to the next month
    // So Feb 30, 2023 becomes Mar 2, 2023 (since Feb 2023 has 28 days)
    expect(formatEffectiveDate('2023-02-30')).toBe('March 2, 2023');
  });

  it('should treat non-standard separators as valid if positions are correct', () => {
     // The function uses substring mapping, so the character at index 4 and 7 doesn't matter
     // It just takes chars 0-3, 5-6, 8-9
     expect(formatEffectiveDate('2023/10/27')).toBe('October 27, 2023');
     expect(formatEffectiveDate('2023a10b27')).toBe('October 27, 2023');
  });
});
